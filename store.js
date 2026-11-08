const products=[
{id:1,name:"Samsung Galaxy A55",type:"phone",price:16999,desc:"شاشة Super AMOLED وأداء قوي",art:"📱",tag:"جديد"},
{id:2,name:"iPhone 13",type:"phone",price:24999,desc:"أداء مميز وكاميرا احترافية",art:"📲",tag:"مميز"},
{id:3,name:"Xiaomi Redmi Note 13",type:"phone",price:8999,desc:"شاشة رائعة وبطارية قوية",art:"📱",tag:"جديد"},
{id:4,name:"OPPO Reno 11F",type:"phone",price:12499,desc:"تصميم أنيق وشحن سريع",art:"📱",tag:"جديد"},
{id:5,name:"iPhone 12 مستعمل",type:"used",price:14500,desc:"حالة ممتازة — افحص الجهاز قبل الشراء",art:"📱",tag:"مستعمل"},
{id:6,name:"Samsung S21 مستعمل",type:"used",price:9200,desc:"حالة جيدة جداً",art:"📱",tag:"مستعمل"},
{id:7,name:"سماعة بلوتوث",type:"accessory",price:650,desc:"صوت واضح واتصال ثابت",art:"🎧",tag:"إكسسوار"},
{id:8,name:"شاحن سريع Type-C",type:"accessory",price:450,desc:"شحن سريع وآمن",art:"🔌",tag:"إكسسوار"}
];
let cart=[];const money=n=>n.toLocaleString("en-US")+" ج.م";
function card(p){return `<article class="product"><div class="product-art">${p.art}</div><div class="product-info"><small>${p.tag}</small><h3>${p.name}</h3><p>${p.desc}</p><div class="price-row"><span class="price">${money(p.price)}</span><button class="add" onclick="addToCart(${p.id})">أضف للسلة +</button></div></div></article>`}
function render(){document.getElementById("phoneProducts").innerHTML=products.filter(p=>p.type==="phone").map(card).join("");document.getElementById("usedProducts").innerHTML=products.filter(p=>p.type==="used").map(card).join("");document.getElementById("accessoryProducts").innerHTML=products.filter(p=>p.type==="accessory").map(card).join("")}
function addToCart(id){let p=products.find(x=>x.id===id),line=cart.find(x=>x.id===id);line?line.qty++:cart.push({...p,qty:1});renderCart();openCart()}
function renderCart(){document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);document.getElementById("cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-line"><span>${x.name} × ${x.qty}</span><b>${money(x.price*x.qty)}</b><button onclick="removeItem(${x.id})">حذف</button></div>`).join(""):"<p class='muted'>السلة فارغة حالياً.</p>";document.getElementById("cartTotal").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0))}
function removeItem(id){cart=cart.filter(x=>x.id!==id);renderCart()}
function openCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("backdrop").classList.add("show")}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("backdrop").classList.remove("show")}
document.getElementById("cartOpen").onclick=openCart;document.getElementById("cartClose").onclick=closeCart;document.getElementById("backdrop").onclick=closeCart;
document.getElementById("checkoutForm").addEventListener("submit",e=>{e.preventDefault();if(!cart.length){alert("أضف منتجاً للسلة أولاً");return}let f=new FormData(e.target),name=f.get("name"),phone=f.get("phone"),address=f.get("address"),notes=f.get("notes");let lines=cart.map(x=>`- ${x.name} × ${x.qty}: ${money(x.price*x.qty)}`).join("%0A");let total=money(cart.reduce((s,x)=>s+x.price*x.qty,0));let msg=`طلب جديد من موقع EL FARES%0Aالاسم: ${encodeURIComponent(name)}%0Aالهاتف: ${encodeURIComponent(phone)}%0Aالعنوان: ${encodeURIComponent(address)}%0A${lines}%0Aالإجمالي: ${encodeURIComponent(total)}%0Aملاحظات: ${encodeURIComponent(notes||"لا يوجد")}`;window.open("https://wa.me/201092915111?text="+msg,"_blank");});
function filterProducts(type){document.getElementById(type==="phone"?"phones":type==="used"?"used":"accessories").scrollIntoView({behavior:"smooth"})}
render();renderCart();