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
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function whatsappInquiry(p){
 const msg=`استفسار عن جهاز من EL FARES\nالمنتج: ${p.name}\nالحالة: ${p.type==='used'?'مستعمل':'جديد'}\nأرجو معرفة التفاصيل والتوفر.`;
 window.open('https://wa.me/201092915111?text='+encodeURIComponent(msg),'_blank');
}
function card(p){
 const imgs=Array.isArray(p.image_urls)?p.image_urls.filter(Boolean):(p.image_url?[p.image_url]:[]);
 const main=imgs[0]?`<img src="${escapeHtml(imgs[0])}" alt="${escapeHtml(p.name)}" loading="lazy">`:`<span>${escapeHtml(p.art||'📱')}</span>`;
 const gallery=imgs.length>1?`<div class="product-thumbs">${imgs.slice(0,4).map((u,i)=>`<img src="${escapeHtml(u)}" alt="${escapeHtml(p.name)} - ${i+1}" loading="lazy">`).join('')}</div>`:'';
 const inquiry=p.type==='phone'||p.type==='used';
 const action=inquiry?`<button class="add" onclick="whatsappInquiry(products.find(x=>String(x.id)==='${String(p.id).replace(/'/g,"\\'")}'))">استفسر على واتساب</button>`:`<button class="add" onclick="addToCart('${String(p.id).replace(/'/g,"\\'")}')">أضف للسلة +</button>`;
 const price=inquiry?'<span class="price">للاستفسار</span>':`<span class="price">${money(p.price)}</span>`;
 return `<article class="product"><div class="product-art ${imgs.length?'has-photo':''}">${main}</div>${gallery}<div class="product-info"><small>${escapeHtml(p.tag||'')}</small><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||p.desc||'')}</p><div class="price-row">${price}${action}</div></div></article>`;
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
const checkoutStart=document.getElementById('checkoutStart');
if(checkoutStart)checkoutStart.addEventListener('click',()=>{if(!cart.length){alert('السلة فارغة. أضف إكسسواراً أولاً.');return;}const form=document.getElementById('checkoutForm');if(form){form.hidden=false;checkoutStart.hidden=true;form.scrollIntoView({behavior:'smooth',block:'start'});}});
function renderCart(){const count=document.getElementById('cartCount'),items=document.getElementById('cartItems'),total=document.getElementById('cartTotal');if(!count)return;count.textContent=cart.reduce((s,x)=>s+x.qty,0);items.innerHTML=cart.length?cart.map(x=>`<div class="cart-line"><span>${escapeHtml(x.name)} × ${x.qty}</span><b>${money(x.price*x.qty)}</b><button onclick="removeItem('${String(x.id).replace(/'/g,"\\'")}')">حذف</button></div>`).join(''):'<p class="muted">السلة فارغة حالياً.</p>';total.textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));}
function removeItem(id){cart=cart.filter(x=>String(x.id)!==String(id));renderCart();}
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('backdrop').classList.add('show');}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('backdrop').classList.remove('show');}
const cartOpen=document.getElementById('cartOpen');if(cartOpen)cartOpen.onclick=openCart;
const cartClose=document.getElementById('cartClose');if(cartClose)cartClose.onclick=closeCart;
const backdrop=document.getElementById('backdrop');if(backdrop)backdrop.onclick=closeCart;
const SHOP_LOCATION={lat:30.273134,lng:31.510820};
let deliveryFee=0,customerDistance=null;
function distanceKm(a,b){
 const rad=x=>x*Math.PI/180, dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
function feeForDistance(km){if(km<=1)return 25;if(km<=3)return 35;if(km<=6)return 60;return 100;}
function updateCheckoutSummary(){
 const el=document.getElementById('deliverySummary');
 if(el)el.textContent=customerDistance===null?'حدد موقعك لحساب التوصيل':`المسافة التقريبية: ${customerDistance.toFixed(2)} كم — التوصيل: ${money(deliveryFee)}`;
}
document.getElementById('locateCustomer')?.addEventListener('click',()=>{
 if(!navigator.geolocation){alert('المتصفح لا يدعم تحديد الموقع.');return;}
 const status=document.getElementById('deliverySummary');status.textContent='جارٍ تحديد موقعك...';
 navigator.geolocation.getCurrentPosition(pos=>{
   customerDistance=distanceKm(SHOP_LOCATION,{lat:pos.coords.latitude,lng:pos.coords.longitude});
   deliveryFee=feeForDistance(customerDistance);updateCheckoutSummary();
 },()=>{status.textContent='تعذر تحديد موقعك. اسمح للمتصفح باستخدام الموقع وحاول مرة أخرى.';},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
});
const checkout=document.getElementById('checkoutForm');
if(checkout)checkout.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!cart.length){alert('أضف إكسسواراً للسلة أولاً');return;}
 if(customerDistance===null){alert('حدد موقعك أولاً لحساب رسوم التوصيل.');return;}
 const f=new FormData(e.target),name=f.get('name'),phone=f.get('phone'),address=f.get('address'),notes=f.get('notes'),payment=f.get('payment');
 if(!/مدينة العبور|العبور/i.test(address)){alert('التوصيل متاح داخل مدينة العبور فقط. اكتب عنوانك داخل مدينة العبور.');return;}
 const subtotal=cart.reduce((s,x)=>s+Number(x.price)*x.qty,0),total=subtotal+deliveryFee;
 const items=cart.map(x=>({product_id:String(x.id),name:x.name,price:Number(x.price),quantity:x.qty}));
 const paymentLabel=payment==='visa'?'فيزا (يتم تأكيد وسيلة الدفع مع المتجر)':payment==='cash'?'كاش':'الدفع عند الاستلام';
 const fullNotes=`طريقة الدفع: ${paymentLabel}\nالمسافة من المحل: ${customerDistance.toFixed(2)} كم بالخط المستقيم\nرسوم التوصيل: ${money(deliveryFee)}\nملاحظات العميل: ${notes||'لا يوجد'}`;
 let saved=true;
 if(db){const {error}=await db.from('orders').insert({customer_name:name,phone,address,notes:fullNotes,items,total});if(error){saved=false;console.error(error);}}
 const lines=cart.map(x=>`- ${x.name} × ${x.qty}: ${money(x.price*x.qty)}`).join('\n');
 const msg=`طلب إكسسوارات جديد من موقع EL FARES\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\n${lines}\nالإجمالي قبل التوصيل: ${money(subtotal)}\nرسوم التوصيل: ${money(deliveryFee)}\nالإجمالي النهائي: ${money(total)}\nطريقة الدفع المختارة: ${paymentLabel}\nالمسافة بالخط المستقيم: ${customerDistance.toFixed(2)} كم\nملاحظات: ${notes||'لا يوجد'}`;
 if(db&&!saved)alert('تعذر حفظ الطلب في قاعدة البيانات، لكن يمكنك إرساله عبر واتساب.');
 window.open('https://wa.me/201092915111?text='+encodeURIComponent(msg),'_blank');
});
function filterProducts(type){document.getElementById(type==='phone'?'phones':type==='used'?'used':'accessories').scrollIntoView({behavior:'smooth'});}
renderCart();loadProducts();
