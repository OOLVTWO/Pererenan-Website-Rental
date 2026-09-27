/**
 * Di HP, papan HP mockup (lebar 390px) diskalakan proporsional ke lebar layar
 * — sama seperti mode "Fit" saat mockup dibuka — dengan memberi tahu browser
 * bahwa lebar layout = 390px lewat meta viewport. Hasilnya proporsi & lipatan
 * teks identik dengan mockup di semua HP (360, 393, 412, 430px, ...).
 *
 * Hanya berlaku bila lebar perangkat (orientasi saat ini) ≤ 480px. Tablet dan
 * desktop tetap `width=device-width` (layout HP melebar / layout desktop).
 * Skrip inline supaya jalan sebelum konten dilukis (tanpa lompatan layout).
 */
const DESIGN_WIDTH = 390;
const MAX_DEVICE_WIDTH = 480;

const SCRIPT = `(function(){
  var D=${DESIGN_WIDTH},M=${MAX_DEVICE_WIDTH};
  var mq=window.matchMedia('(orientation: landscape)');
  function apply(){
    var a=screen.width,b=screen.height;
    var w=mq.matches?Math.max(a,b):Math.min(a,b);
    var m=document.getElementById('lp-viewport');
    if(!m){m=document.createElement('meta');m.name='viewport';m.id='lp-viewport';document.head.appendChild(m);}
    m.content=w<=M?'width='+D+', initial-scale='+(w/D):'width=device-width, initial-scale=1';
  }
  apply();
  if(mq.addEventListener)mq.addEventListener('change',apply);
})();`;

export default function MobileFit() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
