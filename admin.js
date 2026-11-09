const ready=window.supabase&&window.EL_FARES_SUPABASE_URL&&window.EL_FARES_SUPABASE_ANON_KEY&&!window.EL_FARES_SUPABASE_URL.includes('ضع_');
const db=ready?window.supabase.createClient(window.EL_FARES_SUPABASE_URL,window.EL_FARES_SUPABASE_ANON_KEY):null;
const $=id=>document.getElementById(id);let editingId=null,productCache=[],editingImageUrls=[];
const money=n=>Number(n||0).toLocaleString('en-US')+' ج.م';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(id,text,error=false){$(id).textContent=text;$(id).style.color=error?'#ff9c9c':'#7de2c0';}
function productImages(p){if(Array.isArray(p.image_urls))return p.image_urls.filter(Boolean);return p.image_url?[p.image_url]:[];}
function showImagePreview(urls=[]){const box=$('imagePreview');if(!box)return;box.innerHTML=urls.map((url,i)=>`<div class="preview-item"><img src="${esc(url)}" alt="صورة المنتج ${i+1}"><small>صورة ${i+1}</small></div>`).join('');}
$('imageFiles')?.addEventListener('change',e=>{
 const files=[...(e.target.files||[])];
 if(files.some(f=>!f.type.startsWith('image/'))){message('productMessage','اختر ملفات صور فقط.',true);e.target.value='';return;}
 if(files.some(f=>f.size>5*1024*1024)){message('productMessage','حجم كل صورة يجب ألا يتجاوز 5 ميجابايت.',true);e.target.value='';return;}
 const urls=files.map(f=>URL.createObjectURL(f));
 showImagePreview(urls);
 if(files.length)message('productMessage',`تم اختيار ${files.length} صورة. سيتم رفعها عند حفظ المنتج.`);
});
async function uploadProductImages(files){
 const {data:{user},error:userError}=await db.auth.getUser();
 if(userError||!user)throw new Error('انتهت جلسة المدير. سجّل الدخول مرة أخرى.');
 const urls=[];
 for(let i=0;i<files.length;i++){
   const file=files[i];
   if(!file.type.startsWith('image/'))throw new Error('الملف المحدد ليس صورة.');
   if(file.size>5*1024*1024)throw new Error('حجم الصورة أكبر من 5 ميجابايت.');
   const safeName=file.name.toLowerCase().replace(/[^a-z0-9._-]/g,'-').slice(-70)||'photo.jpg';
   const path=`${user.id}/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}-${safeName}`;
   const {error}=await db.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
   if(error)throw new Error('تعذر رفع الصورة: '+error.message);
   const {data}=db.storage.from('product-images').getPublicUrl(path);
   urls.push(data.publicUrl);
 }
 return urls;
}
if(!ready){$('setupText').textContent='لم يتم إعداد Supabase بعد. افتح supabase-config.js وضع رابط المشروع ومفتاح النشر العام.';$('loginPanel').classList.add('hidden');}
else{$('setupPanel').classList.add('hidden');checkSession();}
async function isAdmin(user){const {data,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();return !error&&!!data;}
async function checkSession(){const {data}=await db.auth.getSession();if(data.session){if(await isAdmin(data.session.user))showDashboard();else{await db.auth.signOut();message('loginMessage','هذا الحساب ليس لديه صلاحية مدير.',true);}}}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!db)return;const f=new FormData(e.target);message('loginMessage','جارٍ تسجيل الدخول...');const {data,error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error){message('loginMessage','تعذر تسجيل الدخول: '+error.message,true);return;}if(!(await isAdmin(data.user))){await db.auth.signOut();message('loginMessage','تم تسجيل الدخول لكن الحساب غير مضاف كمدير في جدول admins.',true);return;}showDashboard();});
function showDashboard(){$('loginPanel').classList.add('hidden');$('dashboard').classList.remove('hidden');$('logoutBtn').classList.remove('hidden');loadProducts();loadOrders();}
$('logoutBtn').onclick=async()=>{await db.auth.signOut();location.reload();};
async function loadProducts(){const {data,error}=await db.from('products').select('*').order('created_at',{ascending:false});if(error){message('productMessage','خطأ في تحميل المنتجات: '+error.message,true);return;}productCache=data||[];$('productsBody').innerHTML=productCache.map(p=>{const imgs=productImages(p);return `<tr><td>${imgs[0]?`<img class="table-thumb" src="${esc(imgs[0])}" alt=""> `:''}${esc(p.name)}</td><td>${esc(p.type)}</td><td>${money(p.price)}</td><td>${p.active?'ظاهر':'مخفي'}</td><td><button data-edit="${p.id}">تعديل</button> <button class="danger" data-delete="${p.id}">حذف</button></td></tr>`}).join('')||'<tr><td colspan="5">لا توجد منتجات بعد.</td></tr>';}
$('productsBody').addEventListener('click',async e=>{const edit=e.target.dataset.edit,del=e.target.dataset.delete;if(edit){const p=productCache.find(x=>x.id===edit),f=$('productForm');editingId=p.id;editingImageUrls=productImages(p);for(const k of ['name','type','price','tag','art','description'])f.elements[k].value=p[k]??'';f.elements.active.checked=!!p.active;f.elements.imageFiles.value='';showImagePreview(editingImageUrls);$('formTitle').textContent='تعديل المنتج';$('cancelEdit').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});}if(del&&confirm('هل تريد حذف هذا المنتج؟')){const {error}=await db.from('products').delete().eq('id',del);message('productMessage',error?'تعذر الحذف: '+error.message:'تم حذف المنتج.',!!error);loadProducts();}});
$('productForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget,f=new FormData(form),files=[...(form.elements.imageFiles.files||[])];
 const row={name:f.get('name').trim(),type:f.get('type'),price:Number(f.get('price')),tag:f.get('tag')||'',art:f.get('art')||'📱',description:f.get('description')||'',active:form.elements.active.checked};
 const submit=form.querySelector('[type="submit"]');submit.disabled=true;message('productMessage','جارٍ حفظ المنتج ورفع الصور...');
 try{
   if(files.length)row.image_urls=await uploadProductImages(files);
   else if(editingId)row.image_urls=editingImageUrls;
   else row.image_urls=[];
   const result=editingId?await db.from('products').update(row).eq('id',editingId):await db.from('products').insert(row);
   if(result.error)throw new Error(result.error.message);
   message('productMessage',files.length?'تم حفظ المنتج ورفع الصور بنجاح.':'تم حفظ المنتج بنجاح.');
   resetForm();await loadProducts();
 }catch(err){message('productMessage','تعذر الحفظ: '+err.message,true);}
 finally{submit.disabled=false;}
});
function resetForm(){const form=$('productForm');form.reset();form.elements.art.value='📱';form.elements.active.checked=true;form.elements.imageFiles.value='';editingId=null;editingImageUrls=[];showImagePreview([]);$('formTitle').textContent='إضافة منتج جديد';$('cancelEdit').classList.add('hidden');}
$('cancelEdit').onclick=resetForm;$('refreshProducts').onclick=loadProducts;
$('exportProducts').onclick=()=>{const rows=[['name','type','price','tag','description','active','image_urls'],...productCache.map(p=>[p.name,p.type,p.price,p.tag,p.description,p.active,productImages(p).join(' | ')])];const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='el-fares-products.csv';a.click();URL.revokeObjectURL(a.href);};
function parseOrderDetails(raw){
 if(typeof raw==='string'){try{raw=JSON.parse(raw);}catch(_){return {products:[]};}}
 if(Array.isArray(raw))return {products:raw,subtotal:raw.reduce((s,x)=>s+Number(x.price||0)*Number(x.quantity||1),0),shipping_fee:0};
 return raw&&typeof raw==='object'?raw:{products:[]};
}
function orderProductsHtml(raw){
 const d=parseOrderDetails(raw),items=Array.isArray(d.products)?d.products:[];
 if(!items.length)return '<span class="muted">تفاصيل المنتج غير متاحة لهذا الطلب القديم</span>';
 const labels={phone:'موبايل جديد',used:'موبايل مستعمل',accessory:'إكسسوار'};
 return '<ul class="order-items">'+items.map(x=>`<li><strong>${esc(x.name||'منتج')}</strong> — ${esc(labels[x.type]||x.type||'غير محدد')} × ${Number(x.quantity||1)}</li>`).join('')+'</ul>';
}
function orderProductPrice(raw){
 const d=parseOrderDetails(raw),items=Array.isArray(d.products)?d.products:(Array.isArray(raw)?raw:[]);
 const subtotal=d.subtotal??items.reduce((s,x)=>s+Number(x.price||0)*Number(x.quantity||1),0);
 return money(subtotal);
}
function orderShipping(raw){const d=parseOrderDetails(raw);return money(d.shipping_fee||0);}
async function loadOrders(){
 const {data,error}=await db.from('orders').select('*').order('created_at',{ascending:false}).limit(100);
 if(error){$('ordersBody').innerHTML=`<tr><td colspan="9">تعذر تحميل الطلبات: ${esc(error.message)}</td></tr>`;return;}
 $('ordersBody').innerHTML=(data||[]).map(o=>`<tr><td>${new Date(o.created_at).toLocaleString('ar-EG')}</td><td>${esc(o.customer_name)}</td><td>${esc(o.phone)}</td><td>${esc(o.address)}</td><td>${orderProductsHtml(o.items)}</td><td class="order-money">${orderProductPrice(o.items)}</td><td class="order-money">${orderShipping(o.items)}</td><td class="order-money">${money(o.total)}</td><td class="order-notes">${esc(o.notes||'—')}</td></tr>`).join('')||'<tr><td colspan="9">لا توجد طلبات حتى الآن.</td></tr>';
}
$('refreshOrders').onclick=loadOrders;
