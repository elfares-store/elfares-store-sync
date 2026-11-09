const DEMO_PRODUCTS = [
 {id:'demo-1',name:'Samsung Galaxy A55',type:'phone',price:16999,description:'شاشة Super AMOLED وأداء قوي',art:'📱',tag:'جديد'},
 {id:'demo-2',name:'iPhone 13',type:'phone',price:24999,description:'أداء مميز وكاميرا احترافية',art:'📲',tag:'مميز'},
 {id:'demo-3',name:'Xiaomi Redmi Note 13',type:'phone',price:8999,description:'شاشة رائعة وبطارية قوية',art:'📱',tag:'جديد'},
 {id:'demo-4',name:'OPPO Reno 11F',type:'phone',price:12499,description:'تصميم أنيق وشحن سريع',art:'📱',tag:'جديد'},
 {id:'demo-5',name:'iPhone 12 مستعمل',type:'used',price:14500,description:'حالة ممتازة — افحص الجهاز قبل الشراء',art:'📱',tag:'مستعمل'},
 {id:'demo-6',name:'Samsung S21 مستعمل',type:'used',price:9200,description:'حالة جيدة جداً',art:'📱',tag:'مستعمل'},
 {id:'demo-7',name:'سماعة بلوتوث',type:'accessory',price:650,description:'صوت واضح واتصال ثابت',art:'🎧',tag:'إكسسوار'},
 {id:'demo-8',name:'شاحن سريع Type-C',type:'accessory',price:450,description:'شحن سريع وآمن',art:'🔌',tag:'إكسسوار'}
];
let products = [...DEMO_PRODUCTS], cart = [];
const money = n => Number(n || 0).toLocaleString('en-US') + ' ج.م';
const configured = () => window.supabase && window.EL_FARES_SUPABASE_URL && window.EL_FARES_SUPABASE_ANON_KEY && !window.EL_FARES_SUPABASE_URL.includes('ضع_');
const db = configured() ? window.supabase.createClient(window.EL_FARES_SUPABASE_URL, window.EL_FARES_SUPABASE_ANON_KEY) : null;
const SHOP_LOCATION={lat:30.273134,lng:31.510820};
let customerLocation=null, deliveryFee=null, deliveryDistance=null;
function straightDistanceKm(a,b){const r=n=>n*Math.PI/180,dLat=r(b.lat-a.lat),dLng=r(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLng/2)**2;return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}
function feeForDistance(km){return km<=1?25:km<=3?35:km<=6?60:100;}
function updateDeliverySummary(){const el=document.getElementById('deliverySummary');if(!el)return;if(deliveryFee===null){el.textContent='حدد موقعك لحساب التوصيل';return;}const sub=cart.reduce((sum,x)=>sum+Number(x.price)*x.qty,0);el.textContent=`المسافة المباشرة: ${deliveryDistance.toFixed(2)} كم — التوصيل: ${money(deliveryFee)} — المنتجات: ${money(sub)} — الإجمالي النهائي: ${money(sub+deliveryFee)}`;}
const locateBtn=document.getElementById('locateCustomer');
if(locateBtn)locateBtn.addEventListener('click',()=>{if(!navigator.geolocation){alert('المتصفح لا يدعم تحديد الموقع.');return;}locateBtn.disabled=true;locateBtn.textContent='جارٍ تحديد موقعك...';navigator.geolocation.getCurrentPosition(pos=>{customerLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};deliveryDistance=straightDistanceKm(SHOP_LOCATION,customerLocation);deliveryFee=feeForDistance(deliveryDistance);locateBtn.disabled=false;locateBtn.textContent='تم تحديد الموقع ✓';updateDeliverySummary();},()=>{locateBtn.disabled=false;locateBtn.textContent='حدد موقعي واحسب التوصيل';alert('اسمح للموقع باستخدام GPS ثم حاول مرة أخرى.');},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});});
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function card(p){
 const imgs=Array.isArray(p.image_urls)?p.image_urls.filter(Boolean):(p.image_url?[p.image_url]:[]);
 const main=imgs[0]?`<img src="${escapeHtml(imgs[0])}" alt="${escapeHtml(p.name)}" loading="lazy">`:`<span>${escapeHtml(p.art||'📱')}</span>`;
 const gallery=imgs.length>1?`<div class="product-thumbs">${imgs.slice(0,4).map((u,i)=>`<img src="${escapeHtml(u)}" alt="${escapeHtml(p.name)} - ${i+1}" loading="lazy">`).join('')}</div>`:'';
 const isPhone=p.type==='phone'||p.type==='used';
 const action=isPhone?`<a class="add" href="https://wa.me/201092915111?text=${encodeURIComponent('أريد الاستفسار عن '+p.name)}" target="_blank" rel="noopener">استفسر عبر واتساب</a>`:`<button class="add" onclick="addToCart('${String(p.id).replace(/'/g,"\\'")}')">أضف للسلة +</button>`;
 return `<article class="product"><div class="product-art ${imgs.length?'has-photo':''}">${main}</div>${gallery}<div class="product-info"><small>${escapeHtml(p.tag||'')}</small><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||p.desc||'')}</p><div class="price-row"><span class="price">${money(p.price)}</span>${action}</div></div></article>`;
}
function render(){
 const groups={phone:'phoneProducts',used:'usedProducts',accessory:'accessoryProducts'};
 Object.entries(groups).forEach(([type,id])=>{const el=document.getElementById(id);if(el)el.innerHTML=products.filter(p=>p.type===type).map(card).join('')||'<p class="muted">لا توجد منتجات في هذا القسم حالياً.</p>';});
}
async function loadProducts(){
 if(db){const {data,error}=await db.from('products').select('*').eq('active',true).order('created_at',{ascending:false});if(!error&&data)products=data;else console.warn('Supabase products:',error);}
 render();
}
function addToCart(id){let p=products.find(x=>String(x.id)===String(id)),line=cart.find(x=>String(x.id)===String(id));if(!p)return;line?line.qty++:cart.push({...p,qty:1});renderCart();}
function renderCart(){const count=document.getElementById('cartCount'),items=document.getElementById('cartItems'),total=document.getElementById('cartTotal');if(!count)return;count.textContent=cart.reduce((s,x)=>s+x.qty,0);items.innerHTML=cart.length?cart.map(x=>`<div class="cart-line"><span>${escapeHtml(x.name)} × ${x.qty}</span><b>${money(x.price*x.qty)}</b><button onclick="removeItem('${String(x.id).replace(/'/g,"\\'")}')">حذف</button></div>`).join(''):'<p class="muted">السلة فارغة حالياً.</p>';total.textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));updateDeliverySummary();}
function removeItem(id){cart=cart.filter(x=>String(x.id)!==String(id));renderCart();}
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('backdrop').classList.add('show');}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('backdrop').classList.remove('show');}
const cartOpen=document.getElementById('cartOpen');if(cartOpen)cartOpen.onclick=openCart;
const cartClose=document.getElementById('cartClose');if(cartClose)cartClose.onclick=closeCart;
const backdrop=document.getElementById('backdrop');if(backdrop)backdrop.onclick=closeCart;
const checkout=document.getElementById('checkoutForm');
if(checkout)checkout.addEventListener('submit',async e=>{
 e.preventDefault();if(!cart.length){alert('أضف منتجاً للسلة أولاً');return;}
 const f=new FormData(e.target),name=f.get('name'),phone=f.get('phone'),address=f.get('address'),notes=f.get('notes')||'',payment=f.get('payment');
 if(!/مدينة العبور|العبور/i.test(address)){alert('التوصيل متاح داخل مدينة العبور فقط.');return;}
 if(!customerLocation||deliveryFee===null){alert('حدد موقعك أولاً لحساب رسوم التوصيل.');return;}
 const subtotal=cart.reduce((sum,x)=>sum+Number(x.price)*x.qty,0),total=subtotal+deliveryFee;
 const products=cart.map(x=>({product_id:String(x.id),name:x.name,type:x.type||'غير محدد',price:Number(x.price),quantity:x.qty,line_total:Number(x.price)*x.qty}));
 const details={products,subtotal,shipping_fee:deliveryFee,distance_km:Number(deliveryDistance.toFixed(3)),payment_method:payment,customer_lat:customerLocation.lat,customer_lng:customerLocation.lng};
 const btn=e.submitter;if(btn){btn.disabled=true;btn.textContent='جارٍ إرسال الطلب...';}
 let saved=false;
 if(db){const {error}=await db.from('orders').insert({customer_name:name,phone,address,notes,items:details,total});if(!error)saved=true;else console.error('Order save failed:',error);}
 const lines=products.map(x=>`- ${x.name} (${x.type}) × ${x.quantity}: ${money(x.line_total)}`).join('\\n');
 const msg=`طلب جديد من موقع EL FARES\\nالاسم: ${name}\\nالهاتف: ${phone}\\nالعنوان: ${address}\\n${lines}\\nسعر المنتجات: ${money(subtotal)}\\nرسوم التوصيل (${deliveryDistance.toFixed(2)} كم): ${money(deliveryFee)}\\nالإجمالي شامل التوصيل: ${money(total)}\\nطريقة الدفع: ${payment==='visa'?'فيزا':payment==='cash'?'كاش':'الدفع عند الاستلام'}\\nملاحظات العميل: ${notes||'لا يوجد'}`;
 if(!saved)alert('تعذر تأكيد حفظ الطلب في قاعدة البيانات. سيتم فتح واتساب لإرساله، لكن يجب مراجعة إعدادات قاعدة البيانات.');
 window.open('https://wa.me/201092915111?text='+encodeURIComponent(msg),'_blank');
 if(btn){btn.disabled=false;btn.textContent='إرسال الطلب على واتساب';}
});
function filterProducts(type){document.getElementById(type==='phone'?'phones':type==='used'?'used':'accessories').scrollIntoView({behavior:'smooth'});}
window.startCheckout=function(){
 const form=document.getElementById('checkoutForm');
 const button=document.getElementById('checkoutStart');
 if(!cart.length){alert('السلة فارغة. أضف منتجات أولاً.');return;}
 if(!form){alert('تعذر فتح بيانات الطلب. حدّث الصفحة وحاول مرة أخرى.');return;}
 form.hidden=false;
 form.removeAttribute('hidden');
 form.style.display='block';
 if(button){button.hidden=true;button.style.display='none';}
 updateDeliverySummary();
 form.scrollIntoView({behavior:'smooth',block:'nearest'});
};
const checkoutStart=document.getElementById('checkoutStart');
if(checkoutStart){
 checkoutStart.addEventListener('click',function(event){
  event.preventDefault();
  window.startCheckout();
 });
}
renderCart();loadProducts();
