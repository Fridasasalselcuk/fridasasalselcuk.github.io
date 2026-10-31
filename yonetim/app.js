const $=id=>document.getElementById(id);
let db=null,user=null,records=[];
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(Number(n)||0);
const today=()=>new Date().toISOString().slice(0,10);
function msg(s){$('login-msg').textContent=s}
function configured(){return window.FRIDA_CONFIG&&window.FRIDA_CONFIG.SUPABASE_URL.startsWith('https://')&&window.FRIDA_CONFIG.SUPABASE_ANON_KEY.length>20}
function row(kind,data){return {user_id:user.id,kind,data}}
async function save(kind,data){const {error}=await db.from('business_data').insert(row(kind,data));if(error)throw error;await load()}
async function load(){ $('sync-status').textContent='Bulut verileri yükleniyor…';const {data,error}=await db.from('business_data').select('*').order('created_at',{ascending:false});if(error)throw error;records=data||[];render();$('sync-status').textContent='✓ Bulut senkronize edildi'}
function items(kind){return records.filter(x=>x.kind===kind)}
function sum(arr,fn){return arr.reduce((a,x)=>a+(Number(fn(x))||0),0)}
function monthRows(kind,month){return items(kind).filter(x=>(x.data.date||x.created_at.slice(0,10)).slice(0,7)===month)}
function table(rows,cols){if(!rows.length)return '<div class="empty">Henüz kayıt yok.</div>';return '<table><thead><tr>'+cols.map(c=>'<th>'+c[0]+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+cols.map(c=>'<td>'+c[1](r)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function render(){
 const m=today().slice(0,7),sales=monthRows('sale',m),expenses=monthRows('expense',m);
 const rev=sum(sales,x=>x.data.total),cost=sum(expenses,x=>x.data.amount);
 $('m-revenue').textContent=money(rev);$('m-expense').textContent=money(cost);$('m-profit').textContent=money(rev-cost);
 const cash=items('cash');$('m-cash').textContent=money(sum(cash,x=>(x.data.direction==='in'?1:-1)*x.data.amount));
 const stockNames=['Dolu damacana','Boş damacana','Bardak su','Diğer'];
 const stock=stockNames.map(name=>{let v=0;items('stock').filter(x=>x.data.product===name).reverse().forEach(x=>{if(x.data.action==='set')v=x.data.qty;else v+=(x.data.action==='in'?1:-1)*x.data.qty});items('sale').filter(x=>x.data.product==='Damacana'&&name==='Dolu damacana').forEach(x=>v-=x.data.qty);items('sale').filter(x=>x.data.product==='Bardak su'&&name==='Bardak su').forEach(x=>v-=x.data.qty);return {name,v}});
 $('stock-cards').innerHTML=stock.map(x=>`<article><small>${x.name}</small><strong>${x.v}</strong></article>`).join('');
 $('cash-balances').innerHTML=['Nakit','Banka','POS'].map(a=>{let v=sum(cash.filter(x=>x.data.account===a),x=>(x.data.direction==='in'?1:-1)*x.data.amount);return `<article><small>${a}</small><strong>${money(v)}</strong></article>`}).join('');
 const recent=records.slice(0,8);$('recent').innerHTML=table(recent,[['Tarih',x=>(x.data.date||x.created_at.slice(0,10))],['İşlem',x=>x.kind],['Açıklama',x=>x.data.note||x.data.product||x.data.name||x.data.type||'-'],['Tutar',x=>money(x.data.total||x.data.amount||0)]]);
 $('sales-list').innerHTML=table(items('sale'),[['Tarih',x=>x.data.date],['Kanal',x=>x.data.channel],['Ürün',x=>x.data.product],['Adet',x=>x.data.qty],['Birim',x=>money(x.data.price)],['Toplam',x=>money(x.data.total)],['Tahsilat',x=>x.data.payment]]);
 $('expenses-list').innerHTML=table(items('expense'),[['Tarih',x=>x.data.date],['Tür',x=>x.data.type],['Açıklama',x=>x.data.note||'-'],['Hesap',x=>x.data.account],['Tutar',x=>money(x.data.amount)]]);
 $('stock-list').innerHTML=table(items('stock'),[['Tarih',x=>x.data.date],['Ürün',x=>x.data.product],['Hareket',x=>x.data.action],['Miktar',x=>x.data.qty],['Açıklama',x=>x.data.note||'-']]);
 $('accounts-list').innerHTML=table(items('account'),[['Hesap',x=>x.data.name],['Tür',x=>x.data.type],['Telefon',x=>x.data.phone||'-'],['Açılış bakiyesi',x=>money(x.data.opening)]]);
 $('cash-list').innerHTML=table(cash,[['Tarih',x=>x.data.date],['Hesap',x=>x.data.account],['Yön',x=>x.data.direction==='in'?'Giriş':'Çıkış'],['Açıklama',x=>x.data.note||'-'],['Tutar',x=>money(x.data.amount)]]);
 report();
}
function report(){let m=$('report-month').value||today().slice(0,7),s=monthRows('sale',m),e=monthRows('expense',m),r=sum(s,x=>x.data.total),c=sum(e,x=>x.data.amount);$('report-result').innerHTML=[['Satış adedi',sum(s,x=>x.data.qty)],['Ciro',money(r)],['Gider',money(c)],['Gelir-gider farkı',money(r-c)]].map(x=>`<article><small>${x[0]}</small><strong>${x[1]}</strong></article>`).join('');$('report-detail').innerHTML='<h2>Satış kanalı dağılımı</h2>'+table(['Gel-al','Eve teslim'].map(ch=>({ch,n:sum(s.filter(x=>x.data.channel===ch),x=>x.data.total),q:sum(s.filter(x=>x.data.channel===ch),x=>x.data.qty)})),[['Kanal',x=>x.ch],['Adet',x=>x.q],['Ciro',x=>money(x.n)]]);}
async function init(){
 $('today').textContent=new Date().toLocaleDateString('tr-TR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
 $('expense-date').value=today();$('report-month').value=today().slice(0,7);
 if(!configured()){msg('Bağlantı kurulmamış. Önce config.js dosyasına Supabase URL ve anon key girin.');return}
 db=window.supabase.createClient(FRIDA_CONFIG.SUPABASE_URL,FRIDA_CONFIG.SUPABASE_ANON_KEY);
 const {data}=await db.auth.getSession();if(data.session){user=data.session.user;showApp();await load().catch(e=>alert(e.message))}
}
function showApp(){$('login-screen').hidden=true;$('app-screen').hidden=false;$('user-area').innerHTML=`<small>${user.email}</small> <button id="logout" class="secondary">Çıkış</button>`;$('logout').onclick=async()=>{await db.auth.signOut();location.reload()}}
$('signup').onclick=async()=>{if(!configured())return msg('Önce config.js bağlantısını tamamlayın.');db=window.supabase.createClient(FRIDA_CONFIG.SUPABASE_URL,FRIDA_CONFIG.SUPABASE_ANON_KEY);const {data,error}=await db.auth.signUp({email:$('email').value,password:$('password').value});if(error)return msg(error.message);msg('Hesap oluşturuldu. E-posta doğrulaması istenirse gelen kutunuzu kontrol edin.');if(data.user&&!data.session) return}
$('login').onclick=async()=>{if(!configured())return msg('Önce config.js bağlantısını tamamlayın.');db=window.supabase.createClient(FRIDA_CONFIG.SUPABASE_URL,FRIDA_CONFIG.SUPABASE_ANON_KEY);const {data,error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error)return msg(error.message);user=data.user;showApp();await load().catch(e=>alert(e.message))}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(x=>x.hidden=x.id!==b.dataset.tab)});
$('quick-sale').onsubmit=async e=>{e.preventDefault();let qty=+$('sale-qty').value,price=+$('sale-price').value,payment=$('sale-payment').value;try{await save('sale',{date:today(),channel:$('sale-channel').value,product:$('sale-product').value,qty,price,total:qty*price,payment,customer:$('sale-customer').value,note:'Satış'});if(payment!=='Veresiye')await save('cash',{date:today(),account:payment==='Nakit'?'Nakit':payment==='Banka'?'Banka':'POS',direction:'in',amount:qty*price,note:'Satış tahsilatı'});e.target.reset();$('sale-qty').value=1;$('sale-price').value=85;alert('Satış kaydedildi')}catch(err){alert(err.message)}};
$('expense-form').onsubmit=async e=>{e.preventDefault();let d={date:$('expense-date').value,type:$('expense-type').value,amount:+$('expense-amount').value,account:$('expense-account').value,note:$('expense-note').value};try{await save('expense',d);if(d.account!=='Ödenmedi')await save('cash',{date:d.date,account:d.account,direction:'out',amount:d.amount,note:d.type+' - '+d.note});e.target.reset();$('expense-date').value=today()}catch(err){alert(err.message)}};
$('stock-form').onsubmit=async e=>{e.preventDefault();try{await save('stock',{date:today(),product:$('stock-product').value,action:$('stock-kind').value,qty:+$('stock-qty').value,note:$('stock-note').value});e.target.reset()}catch(err){alert(err.message)}};
$('account-form').onsubmit=async e=>{e.preventDefault();try{await save('account',{name:$('account-name').value,type:$('account-type').value,phone:$('account-phone').value,opening:+$('account-opening').value});e.target.reset()}catch(err){alert(err.message)}};
$('cash-form').onsubmit=async e=>{e.preventDefault();try{await save('cash',{date:today(),account:$('cash-account').value,direction:$('cash-kind').value,amount:+$('cash-amount').value,note:$('cash-note').value});e.target.reset()}catch(err){alert(err.message)}};
$('report-month').onchange=report;
$('export-csv').onclick=()=>{let rows=[['Tür','Tarih','Açıklama','Tutar']];records.forEach(x=>rows.push([x.kind,x.data.date||'',x.data.note||x.data.name||x.data.type||'',x.data.total||x.data.amount||'']));let csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='frida-islemler.csv';a.click()};
init();
