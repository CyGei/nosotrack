// A ten-second ward simulation. Soppycraft furniture is mapped to existing brand tokens.
// Asset provenance and usage terms: public/foundry-demo/hospital/CREDITS.md.
const CYCLE = 10;
const W = 640, H = 360;
const ramp = (t, start, duration = 0.5) => Easing.easeInOutCubic(clamp((t - start) / duration, 0, 1));
// The same brand red across all infected sprites, with tonal steps retaining their detail.
const INFECTED_PALETTE=Object.fromEntries([
  [COLOR.ink,COLOR.ink,0.5],[COLOR.text,COLOR.ink,0.35],[COLOR.mute,COLOR.ink,0.2],
  [COLOR.faint,COLOR.alert,0],[COLOR.patient,COLOR.panel,0.12],
  [COLOR.ward,COLOR.panel,0.28],[COLOR.bgAlt,COLOR.panel,0.16],[COLOR.panel,COLOR.alert,0],
].map(([source,target,amount])=>[source,'#'+[1,3,5].map(i=>
  Math.round(parseInt(COLOR.alert.slice(i,i+2),16)*(1-amount)+parseInt(target.slice(i,i+2),16)*amount)
    .toString(16).padStart(2,'0')).join('')]));
// Connected clinical and public spaces, rather than a repeated room tile.
const ROOMS = [
  {x:28,y:34,w:132,h:138,door:139,kind:'shared'},
  {x:164,y:34,w:96,h:138,door:237,kind:'single'},
  {x:264,y:34,w:112,h:138,door:353,kind:'treatment'},
  {x:380,y:34,w:124,h:138,door:481,kind:'recovery'},
  {x:28,y:214,w:98,h:112,door:104,kind:'isolation',entryTop:true},
  {x:130,y:214,w:94,h:112,door:201,kind:'lab',entryTop:true},
];
const BEDS = [
  {x:43,y:76,person:'a',monitor:true},{x:95,y:76,person:'e'},
  {x:181,y:76,person:'c',monitor:true},
  {x:287,y:79,person:'g',exam:true},
  {x:397,y:76,person:'f'},{x:449,y:76,person:'h'},
  {x:43,y:250,person:'d',monitor:true},
];
// Story identities: a/e/c/d = patients 1/2/3/4; b/s1 = staff 1/2.
// Contact events drive infection onsets and the same five directional reconstruction edges.
const LINKS = [
  {from:'a',to:'e',contact:0.5,at:5.15},
  {from:'e',to:'b',contact:1.35,at:5.3},
  {from:'b',to:'c',contact:2.5,at:5.45},
  {from:'c',to:'s1',contact:3.25,at:5.6},
  {from:'s1',to:'d',contact:5.1,at:5.75},
];
const INFECTION_AT={a:0.25,f:2.8,...Object.fromEntries(LINKS.map(edge=>[edge.to,edge.contact]))};
const PEOPLE = [
  ...BEDS.map(b=>({id:b.person,patient:true,bed:true,path:[[0,b.x+12,b.y+28],[10,b.x+12,b.y+28]]})),
  {id:'b',staff:true,reset:true,idleFacing:'left',path:[
    [0,124,110],[1.55,124,110],[1.62,124,145],[1.7,139,145],[1.95,139,190],
    [2.2,237,190],[2.35,237,125],[2.45,214,119],[2.8,214,119],
    [3.05,237,139],[10,237,139],
  ]},
  {id:'s1',staff:true,reset:true,idleFacing:'left',path:[
    [0,250,193],[2.45,250,193],[2.65,237,193],[2.9,237,125],
    [3.1,214,119],[3.5,214,119],[3.7,237,125],[4,237,190],
    [4.5,104,190],[4.7,104,238],[4.85,77,238],[5,77,283],[10,77,283],
  ]},
  {id:'s2',idleFacing:'left',path:[[0,353,193],[0.8,353,129],[2,353,129],[2.8,353,193],[3.8,340,193],[4.4,340,222],[7.7,340,222],[8.4,340,193],[10,353,193]]},
  {id:'lab',idleFacing:'up',path:[[0,197,305],[2,197,305],[3,204,305],[4,204,271],[6,204,271],[7,204,305],[8,197,305],[10,197,305]]},
  {id:'reception',seated:true,path:[[0,280,264],[10,280,264]]},
  {id:'v1',visitor:true,seated:true,hair:1,path:[[0,411,254],[10,411,254]]},
  {id:'v2',visitor:true,seated:true,hair:2,path:[[0,464,302],[10,464,302]]},
  {id:'v3',visitor:true,hair:2,path:[[0,352,315],[1,352,290],[2,299,290],[4,299,290],[5,352,290],[6,352,315],[8,352,315],[9,352,290],[10,352,315]]},
  {id:'v4',visitor:true,hair:1,path:[[0,425,134],[1.5,425,134],[2.3,481,134],[3,481,193],[4.5,393,193],[6,393,193],[7.5,481,193],[8.1,481,134],[9,425,134],[10,425,134]]},
].map(person=>person.id==='f'?{...person,bed:false,reset:true,idleFacing:'left',path:[
  [0,409,104],[1.1,409,104],[1.35,389,104],[1.7,389,128],
  [2,410,128],[2.5,410,158],[10,410,158],
]}:person).map(person=>({...person,infected:INFECTION_AT[person.id]})).map(person=>{
  if(person.reset||person.path.length<=2)return person;
  // Return to the resting pose before the wrap, avoiding a direction/footstep pop at 0s.
  const home=person.path[person.path.length-1].slice(1);
  return {...person,path:[...person.path.slice(0,-1),[9.8,...home],[CYCLE,...home]]};
});
// The terminal follows patient records as encounters occur, then holds the final card.
const EHR_CARDS=[{id:'a',label:'Patient 1',at:0},{id:'e',label:'Patient 2',at:0.6},
  {id:'c',label:'Patient 3',at:2.6},{id:'d',label:'Patient 4',at:5.2}];
const activeCard=t=>EHR_CARDS.filter(card=>card.at<=t).slice(-1)[0];
function position(person, t) {
  // Fade story actors out and back into their starting poses only after the network hold.
  const path = person.path;
  if(person.reset&&t>=9.85)return path[0].slice(1);
  for (let i = 1; i < path.length; i++) {
    if (t <= path[i][0]) {
      const a = path[i-1], b = path[i], p = clamp((t-a[0])/(b[0]-a[0]),0,1);
      return [a[1]+(b[1]-a[1])*p,a[2]+(b[2]-a[2])*p];
    }
  }
  return path[path.length-1].slice(1);
}
// Decode the tiny local sprites once. Palette conversion happens off the animation loop.
const FURNITURE_NAMES = ['lab_computer'];
let furniturePromise;
const STATIC_LAYERS = new WeakMap();
function loadFurniture() {
  if (!furniturePromise) furniturePromise = Promise.all(FURNITURE_NAMES.map(name => new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const tile = document.createElement('canvas'); tile.width=img.width; tile.height=img.height;
      const context=tile.getContext('2d'); context.drawImage(img,0,0);
      const pixels=context.getImageData(0,0,tile.width,tile.height);
      const palette=[COLOR.ink,COLOR.text,COLOR.mute,COLOR.faint,COLOR.patient,COLOR.ward,COLOR.bgAlt,COLOR.panel]
        .map(hex=>[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16)));
      for(let i=0;i<pixels.data.length;i+=4) {
        if(!pixels.data[i+3])continue;
        const luminance=0.2126*pixels.data[i]+0.7152*pixels.data[i+1]+0.0722*pixels.data[i+2];
        const tone=palette[Math.min(palette.length-1,Math.floor(luminance/256*palette.length))];
        pixels.data.set(tone,i);
      }
      context.putImageData(pixels,0,0); resolve([name,tile]);
    };
    img.onerror=()=>resolve([name,null]);
    img.src=`/foundry-demo/hospital/${name}.png`;
  }))).then(entries=>Object.fromEntries(entries));
  return furniturePromise;
}
function drawHospital(ctx, t, furniture) {
  const c = COLOR, fade = 1-ramp(t,9.4,0.3);
  const rect = (x,y,w,h,color,alpha=1) => {
    if(w<=0||h<=0||alpha<=0)return;
    ctx.globalAlpha=alpha;ctx.fillStyle=color;
    ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));ctx.globalAlpha=1;
  };
  // Bresenham clusters keep every architectural and sprite edge on the native pixel grid.
  // Vector-style paths are reserved for the separate transmission overlay.
  const line = (points,color,width=1,alpha=1,dash=[]) => {
    let pixel=0;
    for(let i=1;i<points.length;i++) {
      let [x,y]=points[i-1].map(Math.round);const [tx,ty]=points[i].map(Math.round);
      const dx=Math.abs(tx-x),sx=x<tx?1:-1,dy=-Math.abs(ty-y),sy=y<ty?1:-1;
      let error=dx+dy;
      while(true) {
        const period=dash.length?dash[0]+dash[1]:1;
        if(!dash.length||pixel%period<dash[0])rect(x,y,Math.max(1,width),Math.max(1,width),color,alpha);
        if(x===tx&&y===ty)break;
        const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}
        pixel++;
      }
    }
  };
  const shadow=(x,y,w,h=4)=>{
    rect(x+2,y,w-4,1,c.ink,0.08);rect(x,y+1,w,h-2,c.ink,0.1);rect(x+2,y+h-1,w-4,1,c.ink,0.06);
  };
  ctx.imageSmoothingEnabled=false;
  const sprite=(name,x,y)=>{
    const tile=furniture[name];if(tile)ctx.drawImage(tile,Math.round(x),Math.round(y));
  };
  rect(0,0,W,H,c.bg);
  // Each architectural edge has a cap, vertical face, skirting and contact shadow.
  function floor(x,y,w,h,warm=false) {
    // Larger, quieter ceramic tiles; the highlights all face the same upper-left light.
    rect(x,y,w,h,warm?c.ward:c.bgAlt);
    for(let tx=x;tx<x+w;tx+=16)for(let ty=y;ty<y+h;ty+=16) {
      const tw=Math.min(15,x+w-tx),th=Math.min(15,y+h-ty);
      rect(tx,ty,tw,th,c.panel,warm?0.34:0.48);
      rect(tx+1,ty+1,tw-2,1,c.panel,0.6);rect(tx+1,ty+2,1,th-3,c.panel,0.4);
    }
  }
  function backWall(x,y,w) {
    rect(x+3,y+19,w-2,7,c.ink,0.075);
    rect(x,y,w,22,c.mute);rect(x+1,y+1,w-2,3,c.panel);
    rect(x+1,y+4,w-2,12,c.bgAlt);rect(x+1,y+16,w-2,3,c.patient);
    rect(x+1,y+19,w-2,2,c.faint);rect(x+1,y+21,w-2,1,c.text);
    // A continuous wall face; no decorative stripes that compete with the furniture.
    rect(x+1,y+5,w-2,1,c.panel);
  }
  function frontWall(x,y,w) {
    if(w<=0)return;
    rect(x+2,y+6,w,3,c.ink,0.09);rect(x,y,w,7,c.mute);
    rect(x+1,y,w-2,3,c.panel);rect(x+1,y+3,w-2,2,c.patient);
    rect(x+1,y+5,w-2,1,c.faint);
  }
  function windowTile(x,y,w=27) {
    rect(x,y,w,13,c.mute);rect(x+1,y+1,w-2,10,c.panel);
    rect(x+2,y+2,w-4,8,c.ward);rect(x+2,y+2,w-4,1,c.faint);
    const mid=x+Math.floor(w/2);
    rect(mid,y+1,2,11,c.mute);rect(mid,y+1,1,11,c.panel);
    line([[x+4,y+8],[x+9,y+3]],c.panel);line([[mid+4,y+8],[mid+9,y+3]],c.panel);
    rect(x-1,y+12,w+2,2,c.panel);rect(x,y+14,w,1,c.faint);
  }
  function radiator(x,y,w=21) {
    rect(x,y+1,w,7,c.mute);rect(x+1,y+1,w-2,6,c.panel);
    for(let i=3;i<w-2;i+=3){rect(x+i,y+2,1,5,c.faint);rect(x+i+1,y+2,1,4,c.patient);}
    rect(x+2,y+8,2,2,c.mute);rect(x+w-4,y+8,2,2,c.mute);rect(x+w,y+2,2,2,c.faint);
  }
  function cabinet(x,y,w=19,h=28) {
    shadow(x+1,y+h-2,w+2);
    rect(x+1,y,w-2,1,c.mute);rect(x,y+1,w,h-1,c.mute);
    rect(x+1,y+1,w-2,3,c.panel);rect(x+1,y+4,w-2,h-6,c.patient);
    rect(x+2,y+5,w-5,h-9,c.bgAlt);rect(x+2,y+5,1,h-9,c.panel);
    const mid=x+Math.floor(w/2);
    rect(mid,y+5,1,h-8,c.faint);rect(mid-3,y+12,1,4,c.text);rect(mid+3,y+12,1,4,c.text);
    rect(x+2,y+h-3,w-4,1,c.faint);rect(x+2,y+h,2,2,c.text);rect(x+w-4,y+h,2,2,c.text);
  }
  function sink(x,y) {
    shadow(x+1,y+16,18,3);
    // Ceramic's thick light rim surrounds a darker bowl; tap and drain remain separate.
    rect(x+2,y+5,16,1,c.mute);rect(x,y+6,20,7,c.mute);rect(x+2,y+13,16,2,c.mute);
    rect(x+1,y+6,18,6,c.panel);rect(x+3,y+12,14,2,c.patient);
    rect(x+4,y+7,12,4,c.faint);rect(x+5,y+8,10,3,c.ward);rect(x+6,y+8,8,1,c.bgAlt);
    rect(x+9,y+10,2,1,c.text);rect(x+7,y+14,6,2,c.bgAlt);rect(x+8,y+16,4,1,c.faint);
    rect(x+9,y+1,2,6,c.mute);rect(x+10,y,5,2,c.text);rect(x+10,y,4,1,c.patient);
    rect(x+13,y+1,2,3,c.mute);rect(x+14,y+1,1,2,c.panel);
    rect(x+3,y+5,3,1,c.faint);rect(x+16,y+5,2,1,c.faint);
  }
  function toilet(x,y) {
    shadow(x+1,y+23,18,4);
    rect(x+2,y,14,1,c.mute);rect(x+1,y+1,16,6,c.mute);
    rect(x+2,y+1,14,4,c.panel);rect(x+2,y+5,14,2,c.patient);rect(x+12,y+2,2,1,c.faint);
    // Four stepped contours make the open seat oval rather than rectangular.
    rect(x+4,y+7,10,1,c.mute);rect(x+2,y+8,14,2,c.mute);
    rect(x+1,y+10,16,8,c.mute);rect(x+3,y+18,12,3,c.mute);rect(x+5,y+21,8,1,c.mute);
    rect(x+4,y+8,10,2,c.panel);rect(x+2,y+10,14,7,c.panel);
    rect(x+4,y+17,10,3,c.panel);rect(x+6,y+20,6,1,c.patient);
    rect(x+6,y+10,6,1,c.faint);rect(x+4,y+11,10,5,c.faint);rect(x+6,y+16,6,2,c.faint);
    rect(x+5,y+12,8,3,c.ward);rect(x+6,y+13,6,2,c.bgAlt);
    rect(x+6,y+22,6,2,c.patient);rect(x+5,y+24,8,1,c.mute);
  }
  function bathroom(x,y,w,h,sideDoor=false) {
    floor(x,y,w,h);backWall(x,y,w);
    rect(x,y+21,2,h-21,c.mute);rect(x+2,y+22,1,h-23,c.patient);
    rect(x+w-2,y+21,2,h-21,c.mute);
    if(sideDoor){
      rect(x,y+h-19,3,17,c.bgAlt);frontWall(x,y+h,w);
      rect(x+2,y+h-19,10,2,c.mute);rect(x+3,y+h-19,8,1,c.panel);
    }else{
      frontWall(x,y+h,9);frontWall(x+w-9,y+h,9);
      rect(x+8,y+h-12,2,12,c.mute);rect(x+8,y+h-11,1,8,c.panel);
    }
  }
  function chair(x,y) {
    shadow(x+1,y+18,19,4);
    // Separate curved back cushion, seat cushion, brushed-metal arms and legs.
    rect(x+4,y,10,1,c.text);rect(x+2,y+1,14,8,c.mute);
    rect(x+3,y+1,12,2,c.panel);rect(x+3,y+3,12,5,c.patient);rect(x+4,y+7,10,1,c.faint);
    rect(x+1,y+9,16,7,c.mute);rect(x+2,y+9,14,4,c.patient);
    rect(x+3,y+9,12,1,c.bgAlt);rect(x+3,y+13,12,2,c.faint);
    rect(x,y+8,2,7,c.text);rect(x+16,y+8,2,7,c.text);
    rect(x,y+8,2,1,c.patient);rect(x+16,y+8,2,1,c.patient);
    rect(x+2,y+16,2,4,c.mute);rect(x+14,y+16,2,4,c.mute);
    rect(x+1,y+20,4,1,c.text);rect(x+13,y+20,4,1,c.text);
  }
  function plant(x,y) {
    shadow(x-6,y+7,14,4);
    // Tapered ceramic pot and asymmetrical leaf clusters; no square foliage blocks.
    rect(x-5,y+1,10,2,c.mute);rect(x-4,y+3,8,5,c.patient);
    rect(x-3,y+8,6,1,c.mute);rect(x-3,y+3,2,4,c.panel);
    rect(x,y-10,1,11,c.text);
    [[-6,-8],[-4,-13],[0,-16],[4,-11],[3,-5],[-3,-4]].forEach(([dx,dy],i)=>{
      rect(x+dx+1,y+dy,2,1,c.mute);rect(x+dx,y+dy+1,4,3,c.text);
      rect(x+dx+1,y+dy+1,2,2,c.mute);rect(x+dx+1,y+dy+4,2,1,c.text);
      rect(x+dx+1,y+dy+1,1,1,c.faint);
    });
  }
  function curtain(x,y,h) {
    rect(x,y,1,h,c.mute);rect(x-2,y+h,6,2,c.mute);rect(x-1,y+h,2,1,c.panel);
    rect(x+1,y+3,6,h-11,c.ward);
    for(let dx=1;dx<7;dx+=2){rect(x+dx,y+4,1,h-13,dx===3?c.faint:c.patient);rect(x+dx,y+1,1,2,c.mute);}
    rect(x+1,y+h-8,5,1,c.faint);rect(x,y,8,1,c.text);
  }
  function monitor(x,y) {
    shadow(x,y+25,18,4);
    rect(x+1,y,14,1,c.mute);rect(x,y+1,16,10,c.text);rect(x+1,y+1,14,2,c.panel);
    rect(x+2,y+3,12,6,c.ink);
    line([[x+3,y+6],[x+5,y+6],[x+6,y+4],[x+7,y+8],[x+9,y+5],[x+10,y+6],[x+12,y+6]],c.patient);
    rect(x+13,y+10,1,1,c.patient);rect(x+7,y+11,2,6,c.mute);
    rect(x+1,y+16,15,2,c.patient);rect(x+2,y+18,13,1,c.mute);
    rect(x+4,y+19,1,7,c.mute);rect(x+12,y+19,1,7,c.mute);
    rect(x+2,y+26,4,2,c.text);rect(x+11,y+26,4,2,c.text);
  }
  function bedside(x,y) {
    shadow(x,y+16,14,4);
    rect(x+1,y,10,1,c.mute);rect(x,y+1,12,16,c.mute);rect(x+1,y+1,10,3,c.panel);
    rect(x+1,y+4,10,11,c.patient);rect(x+2,y+5,8,4,c.bgAlt);
    rect(x+5,y+7,3,1,c.text);rect(x+2,y+10,8,1,c.faint);rect(x+2,y+11,8,3,c.ward);
    rect(x+1,y+17,2,2,c.text);rect(x+9,y+17,2,2,c.text);
  }
  function dispenser(x,y) {
    rect(x+1,y,6,1,c.mute);rect(x,y+1,8,11,c.mute);rect(x+1,y+1,6,9,c.panel);
    rect(x+2,y+3,4,3,c.patient);rect(x+3,y+7,2,2,c.faint);rect(x+2,y+11,4,2,c.text);
  }
  function counterFront() {
    rect(235,262,94,14,c.mute);rect(239,258,86,20,c.mute);
    rect(236,263,92,3,c.panel);rect(240,259,84,5,c.panel);
    rect(240,267,84,10,c.patient);rect(242,268,80,1,c.bgAlt);
    [247,266,285,304].forEach(px=>{rect(px,270,15,5,c.ward);rect(px,275,15,1,c.faint);});
    sprite('lab_computer',249,252);sprite('lab_computer',302,252);
    rect(284,261,9,5,c.bgAlt);rect(285,262,5,1,c.faint);
  }
  let background=STATIC_LAYERS.get(furniture);
  if(!background){
    background=document.createElement('canvas');background.width=W;background.height=H;
    const displayContext=ctx;ctx=background.getContext('2d');ctx.imageSmoothingEnabled=false;
    rect(0,0,W,H,c.bg);
    rect(27,35,482,296,c.ink,0.085);floor(24,30,482,298,true);
    floor(28,180,474,30,true);floor(228,214,274,110,true);
    line([[29,181],[501,181]],c.faint,1,0.45);line([[29,210],[501,210]],c.faint,1,0.45);
    ROOMS.forEach(({x,y,w,h,door,kind,entryTop})=>{
      floor(x+3,y+21,w-6,h-24);
      backWall(x,y,w);
      rect(x,y,3,h,c.mute);rect(x+1,y+1,1,h-2,c.panel);rect(x+3,y+22,2,h-23,c.ink,0.07);rect(x+w-3,y,3,h,c.mute);rect(x+w-2,y+1,1,h-2,c.patient);
      if(entryTop){
        rect(door-12,y,24,23,c.bgAlt);frontWall(x,y+h-5,w);
        // Open door leaf has a recessed glass panel and a metal handle.
        rect(door-13,y+3,3,20,c.mute);rect(door-12,y+5,1,12,c.panel);rect(door-10,y+17,2,1,c.text);
      } else {
        frontWall(x,y+h-5,door-12-x);frontWall(door+12,y+h-5,x+w-door-12);
        rect(door-13,y+h-24,3,20,c.mute);rect(door-12,y+h-22,1,12,c.panel);rect(door-10,y+h-9,2,1,c.text);
      }
      rect(door-10,entryTop?y+22:y+h-3,20,2,c.patient);
      windowTile(x+14,y+5,kind==='shared'?39:27);
      if(!entryTop)radiator(x+15,y+25,20);
    });
    // Shallow curtains divide bed bays while preserving clear walking routes.
    curtain(88,70,58);curtain(442,70,58);
    BEDS.forEach(b=>{
      const {x,y,exam}=b;
      // Shaped headboard, padded mattress, continuous linen, chrome side rails and castors.
      shadow(x+1,y+41,26,6);
      rect(x+4,y,16,1,c.mute);rect(x+2,y+1,20,4,c.mute);
      rect(x+3,y+1,18,2,c.panel);rect(x+4,y+3,16,1,c.patient);
      rect(x+2,y+5,20,33,c.mute);rect(x+3,y+5,18,32,c.patient);
      rect(x+4,y+6,16,30,c.panel);
      rect(x+6,y+6,12,1,c.patient);rect(x+5,y+7,14,8,c.bgAlt);rect(x+6,y+8,12,4,c.panel);
      rect(x+6,y+14,12,1,c.patient);
      const blanket=exam?c.patient:(['e','h'].includes(b.person)?c.patient:c.faint);
      rect(x+5,y+20,14,16,blanket);rect(x+5,y+20,14,2,c.bgAlt);
      rect(x+6,y+23,1,11,c.panel,0.4);rect(x+18,y+23,1,12,c.mute,0.45);
      line([[x+7,y+25],[x+9,y+27],[x+10,y+27]],c.panel,1,0.35);
      line([[x+16,y+31],[x+14,y+33],[x+14,y+35]],c.mute,1,0.3);
      rect(x,y+14,2,17,c.mute);rect(x+22,y+14,2,17,c.mute);
      rect(x,y+14,2,2,c.panel);rect(x+22,y+14,2,2,c.panel);
      rect(x,y+17,1,11,c.patient);rect(x+22,y+17,1,11,c.patient);
      rect(x+3,y+37,18,5,c.mute);rect(x+4,y+37,16,2,c.panel);rect(x+4,y+39,16,2,c.patient);
      rect(x+4,y+42,2,2,c.mute);rect(x+18,y+42,2,2,c.mute);
      rect(x+3,y+44,4,2,c.text);rect(x+17,y+44,4,2,c.text);
      // The isolation room keeps its bedside space clear for care.
      if(['e','f','h'].includes(b.person))bedside(x+27,y+3);
    });
    // Each room has its own restrained programme of equipment.
    cabinet(137,64,15,29);chair(132,117);
    chair(178,139);dispenser(247,146);
    bathroom(211,57,45,49);toilet(214,79);sink(234,78);
    cabinet(333,64,25,28);sink(338,105);monitor(268,96);
    sink(33,139);
    rect(314,62,12,17,c.mute);rect(315,63,10,15,c.panel);
    rect(318,65,4,10,c.patient);rect(316,69,8,2,c.faint);
    sink(384,137);chair(451,140);
    bathroom(88,249,35,71,true);toilet(96,270);sink(93,298);
    // One uncluttered laboratory bench; clear floor and a separate working position.
    rect(141,250,45,23,c.mute);rect(142,251,43,6,c.panel);
    rect(142,257,43,15,c.patient);rect(144,259,18,11,c.bgAlt);
    rect(163,258,1,13,c.faint);rect(166,259,17,11,c.ward);
    rect(152,261,4,1,c.mute);rect(172,261,4,1,c.mute);
    sink(142,237);
    // Microscope: angled optical tube, pale cast-metal arm, objective, slide and focus wheel.
    rect(168,250,14,3,c.mute);rect(169,250,12,1,c.panel);rect(171,247,8,3,c.patient);
    line([[178,247],[179,243],[179,237],[176,234]],c.text,2);
    line([[177,246],[178,242],[178,238],[176,236]],c.patient);
    line([[169,231],[174,236]],c.text,3);line([[170,232],[173,235]],c.faint);
    rect(168,231,4,2,c.text);rect(174,237,2,4,c.mute);rect(174,240,2,1,c.panel);
    rect(167,242,11,2,c.mute);rect(170,241,5,1,c.panel);
    rect(180,240,3,3,c.text);rect(180,240,2,2,c.faint);
    // Reception counter: rounded pixel corners, stone top, panelled front, two workstations.
    backWall(238,219,87);cabinet(243,242,16,17);
    counterFront();
    rect(241,225,20,11,c.mute);rect(242,226,18,9,c.panel);
    [228,231,233].forEach(py=>rect(244,py,12,1,c.faint));
    // Round clock, built from stepped pixels, no illegible labels.
    rect(305,225,6,10,c.mute);rect(303,227,10,6,c.mute);rect(304,227,8,6,c.panel);rect(305,226,6,8,c.panel);
    rect(308,227,1,4,c.text);rect(308,230,3,1,c.text);
    backWall(390,219,112);
    [403,426,449,472].forEach(px=>chair(px,241));
    [403,426,449,472].forEach(px=>chair(px,288));
    shadow(435,280,33,5);rect(437,270,27,1,c.mute);rect(435,271,31,8,c.mute);
    rect(436,271,29,5,c.panel);rect(436,276,29,2,c.patient);
    rect(439,272,10,3,c.ward);rect(443,272,1,3,c.faint);rect(440,273,2,1,c.faint);
    rect(453,272,8,3,c.patient);rect(455,272,5,1,c.bgAlt);
    rect(438,279,2,5,c.text);rect(462,279,2,5,c.text);
    plant(381,308);plant(491,198);plant(241,307);
    // Lift doors and entrance mat anchor the public circulation.
    rect(362,222,22,37,c.text);rect(363,223,20,3,c.panel);rect(364,227,18,30,c.patient);
    rect(365,228,7,27,c.ward);rect(374,228,7,27,c.ward);rect(365,228,1,27,c.panel);rect(374,228,1,27,c.panel);rect(373,227,1,30,c.mute);rect(364,256,18,1,c.text);
    rect(357,236,3,8,c.mute);rect(358,238,1,2,c.panel);rect(358,242,1,1,c.panel);
    frontWall(24,324,305);frontWall(372,324,134);
    rect(331,315,39,12,c.patient);for(let py=317;py<326;py+=2)rect(334,py,33,1,c.faint);
    STATIC_LAYERS.set(furniture,background);ctx=displayContext;
  }
  ctx.drawImage(background,0,0);
  // A separate environmental episode: contaminated basin and tap, without adding
  // an unsupported transmission edge to the six-person reconstruction chain.
  const sinkContamination=ramp(t,0.25,0.35)*fade;
  rect(388,144,12,4,c.alert,sinkContamination*0.7);
  rect(390,145,8,1,c.panel,sinkContamination*0.45);
  rect(393,147,2,1,c.ink,sinkContamination*0.7);
  rect(394,137,4,1,c.alert,sinkContamination*0.85);
  const pos = Object.fromEntries(PEOPLE.map(p=>[p.id,position(p,t)]));
  PEOPLE.slice().sort((a,b)=>pos[a.id][1]-pos[b.id][1]).forEach(p=>{
    const [x,y]=pos[p.id], before=position(p,Math.max(0,t-0.03));
    const walking=Math.hypot(x-before[0],y-before[1])>0.1;
    const usingSink=p.id==='f'&&t>=2.5&&t<9.7;
    const step=walking ? Math.floor(t*7)%2 : 0;
    const infection=p.infected==null?0:ramp(t,p.infected,0.35)*fade;
    const actorAlpha=p.reset?(t<9.85?1-ramp(t,9.7,0.15):ramp(t,9.85,0.15)):1;
    // Recolour only the person's pixels; furniture, bedding and shadows retain their palette.
    const personRect=(px,py,w,h,color,alpha=1)=>{
      rect(px,py,w,h,color,alpha*actorAlpha);
      if(infection>0.001)rect(px,py,w,h,INFECTED_PALETTE[color]||c.alert,alpha*infection*actorAlpha);
    };
    // Reuse the patient's exact head silhouette and palette in bed and on foot.
    const patientHead=(side=0)=>{
      const hair=['e','h'].includes(p.id)?c.mute:c.text;
      personRect(x-2,y-22,4,1,hair);personRect(x-4,y-21,8,4,hair);
      personRect(x-3,y-19,6,5,c.patient);personRect(x-2,y-18,5,3,c.ward);
      personRect(x-4,y-19,1,3,hair);
      if(side===0){personRect(x-2,y-18,2,1,c.mute);personRect(x+1,y-18,2,1,c.mute);}
      else personRect(x+side*2,y-18,1,1,c.mute);
      personRect(x,y-16,1,1,c.faint);personRect(x-1,y-14,3,2,c.patient);
    };
    const restingInBed=p.bed||(p.id==='f'&&(t<=1.1||t>=9.85));
    if(restingInBed) {
      patientHead();
      personRect(x-4,y-12,8,3,c.ward);personRect(x-5,y-11,2,3,c.patient);personRect(x+3,y-11,2,3,c.patient);
      personRect(x-6,y-8,2,3,c.patient);personRect(x+4,y-8,2,3,c.patient);
    } else {
      if(actorAlpha>0.5)shadow(x-7,y+3,15,4);
      // Walking keeps a stable head height; alternating feet AND arms give a measured gait.
      const dx=x-before[0],dy=y-before[1];
      const facing=walking?(Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down')):(p.idleFacing||'down');
      const side=facing==='left'?-1:facing==='right'?1:0,back=facing==='up';
      if(p.patient)patientHead(side);
      else {
      const hair=p.hair===2?c.mute:c.text, hairLight=p.hair===2?c.faint:c.mute;
      personRect(x-3,y-23,6,1,hair);personRect(x-5,y-22,10,2,hair);personRect(x-6,y-20,12,5,hair);
      personRect(x-5,y-15,10,2,hair);personRect(x-3,y-22,5,1,hairLight);personRect(x-4,y-21,3,1,hairLight);
      if(!back) {
        personRect(x-4+side,y-19,8,5,c.patient);personRect(x-3+side,y-18,6,4,c.ward);
        personRect(x-4,y-20,8,2,hair);personRect(x-5,y-19,2,3,hair);
        if(side===0){personRect(x-2,y-17,1,1,c.text);personRect(x+2,y-17,1,1,c.text);}
        else {personRect(x+side*3,y-17,1,1,c.text);personRect(x+side*5,y-16,1,2,c.patient);}
        personRect(x+side,y-14,1,1,c.faint);
      }else{personRect(x-3,y-15,6,1,hairLight);}
      if(p.hair===1){personRect(x-6,y-18,2,8,hair);personRect(x+4,y-18,2,6,hair);personRect(x-5,y-17,1,4,hairLight);}
      }
      personRect(x-2,y-12,4,2,c.patient);
      const cloth=p.visitor?c.text:p.patient?c.ward:c.panel, clothShade=p.visitor?c.mute:c.patient;
      personRect(x-3,y-11,6,1,c.mute);personRect(x-5,y-10,10,10,c.mute);personRect(x-4,y-10,8,9,cloth);
      personRect(x-4,y-9,1,8,p.visitor?c.mute:c.bgAlt);personRect(x+3,y-8,1,7,clothShade);
      const swing=walking?(step?1:-1):0;
      personRect(x-6,y-9+swing,2,6,cloth);personRect(x+4,y-9-swing,2,6,clothShade);
      personRect(x-6,y-3+swing,2,2,c.patient);personRect(x+4,y-3-swing,2,2,c.patient);
      if(!p.visitor&&!p.patient&&!back){
        personRect(x-3,y-10,2,2,c.patient);personRect(x+1,y-10,2,2,c.patient);
        personRect(x,y-7,1,7,c.faint);personRect(x+2,y-7,2,3,c.mute);personRect(x+2,y-7,2,1,c.panel);
        personRect(x-3,y-2,2,1,c.faint);
      }else if(back){personRect(x-3,y-1,6,1,clothShade);}
      if(p.seated){
        // Bent knees and forward shoes replace the old shortened standing pose.
        personRect(x-5,y,4,3,c.mute);personRect(x+1,y,4,3,c.mute);
        personRect(x-5,y+3,3,2,c.text);personRect(x+2,y+3,3,2,c.text);
        personRect(x-6,y+5,4,2,c.ink);personRect(x+2,y+5,4,2,c.ink);
        personRect(x-6,y-3,3,2,c.patient);personRect(x+3,y-3,3,2,c.patient);
      }else{
        personRect(x-4,y,3,5-step,c.text);personRect(x+1,y,3,4+step,c.text);
        personRect(x-5,y+4-step,4,2,c.ink);personRect(x+1,y+3+step,4,2,c.ink);
      }
      if(p.patient){
        // A loose hospital gown, bare lower legs and slippers distinguish patients from staff.
        personRect(x-5,y-1,10,4,c.ward);personRect(x-4,y+2,8,1,c.patient);
        personRect(x-3,y+3,2,2,c.patient);personRect(x+1,y+3,2,2,c.patient);
      }
      if(usingSink){
        // Side-on hands reach over the ceramic rim; a tiny water stream gives the
        // action a readable purpose without obscuring the basin or adding effects.
        personRect(x-9,y-10,5,2,c.ward);personRect(x-11,y-10,3,2,c.patient);
        personRect(x-8,y-7,4,2,c.ward);personRect(x-10,y-8,3,2,c.patient);
        rect(398,141,1,3,c.panel,0.8);
        rect(398+(Math.floor(t*4)%2),145,1,1,c.panel,0.75);
      }
      if(p.visitor&&!p.seated){personRect(x+6,y-2,4,6,c.mute);personRect(x+7,y-4,2,2,c.text);personRect(x+7,y,2,3,c.patient);}
    }
    // The receptionist sits behind the counter; visitors in front draw afterwards.
    if(p.id==='reception')counterFront();
  });
  // One quiet EHR workstation replaces the separate feeds and moving record tiles.
  const card=activeCard(t),cardAlpha=ramp(t,0,0.3)*(1-ramp(t,9.4,0.3));
  rect(522,136,101,80,c.ink,0.05);
  rect(520,134,102,80,c.mute);rect(521,135,100,78,c.patient);
  rect(524,138,94,69,c.panel);rect(524,138,94,16,c.bgAlt);
  rect(524,153,94,1,c.ward);
  rect(566,214,10,13,c.patient);rect(563,225,16,2,c.mute);
  rect(550,228,42,3,c.patient);rect(548,231,46,2,c.mute);
  rect(539,240,65,10,c.patient);rect(540,240,63,8,c.bgAlt);
  for(let row=0;row<2;row++)for(let col=0;col<11;col++)rect(543+col*5,242+row*3,3,1,c.faint);
  rect(555,247,27,1,c.faint);
  // Patient portrait and a few structured record rows; no competing source panels.
  rect(531,163,24,29,c.bgAlt,cardAlpha);
  const hair=card.id==='e'?c.mute:c.text;
  rect(540,167,6,1,hair,cardAlpha);rect(538,168,10,5,hair,cardAlpha);
  rect(539,171,8,7,c.patient,cardAlpha);rect(540,172,6,5,c.ward,cardAlpha);
  rect(540,173,1,1,c.mute,cardAlpha);rect(545,173,1,1,c.mute,cardAlpha);
  rect(541,178,4,2,c.patient,cardAlpha);rect(537,181,12,7,c.ward,cardAlpha);
  const update=ramp(t,card.at+0.2,0.35)*cardAlpha;
  rect(562,181,42,1,c.patient,cardAlpha);rect(562,186,34,1,c.ward,cardAlpha);
  rect(531,198,74,1,c.ward,cardAlpha);
  rect(562,191,3,3,c.alert,update);rect(569,192,30,1,c.faint,update);
  rect(569,210,4,1,c.text);
  // Match the site's transmission trees: solid red Manhattan edges, rounded elbows,
  // endpoint clearance and a filled directional arrow. No dotted observation trails obscure the hospital.
  LINKS.forEach(edge=>{
    const reveal=ramp(t,edge.at,0.45),a=pos[edge.from],b=pos[edge.to];
    if(reveal<=0||fade<=0)return;
    const ac=[a[0],a[1]-9],bc=[b[0],b[1]-9],clearance=14;
    // Explicit lanes keep each arrow attached to its actual source and recipient.
    // All six actors remain at these endpoints for the full 3.2-second network hold.
    let points;
    if(edge.from==='a')
      points=[[ac[0],ac[1]+clearance],[ac[0],145],[bc[0],145],[bc[0],bc[1]+clearance]];
    else if(edge.from==='e')
      points=[[ac[0]+clearance,ac[1]],[145,ac[1]],[145,157],[bc[0],157],[bc[0],bc[1]+clearance]];
    else if(edge.from==='b')
      points=[[ac[0]-clearance,ac[1]],[bc[0],ac[1]],[bc[0],bc[1]+clearance]];
    else if(edge.from==='c')
      points=[[ac[0]-clearance,ac[1]],[173,ac[1]],[173,184],[bc[0],184],[bc[0],bc[1]-clearance]];
    else
      points=[[ac[0],ac[1]+clearance],[ac[0],302],[bc[0],302],[bc[0],bc[1]+clearance]];
    const path=new Path2D();path.moveTo(...points[0]);
    let length=0;
    for(let i=1;i<points.length;i++)length+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);
    for(let i=1;i<points.length-1;i++){
      const previous=points[i-1],corner=points[i],next=points[i+1];
      const inLength=Math.hypot(corner[0]-previous[0],corner[1]-previous[1]);
      const outLength=Math.hypot(next[0]-corner[0],next[1]-corner[1]);
      const radius=Math.min(4,inLength/2,outLength/2);
      const before=corner.map((v,axis)=>v-(v-previous[axis])/(inLength||1)*radius);
      const after=corner.map((v,axis)=>v+(next[axis]-v)/(outLength||1)*radius);
      path.lineTo(...before);path.quadraticCurveTo(...corner,...after);
      // Length of a quadratic rounded 90-degree elbow, relative to the two straight legs.
      length-=radius*(2-1.6232);
    }
    const end=points[points.length-1],previous=points[points.length-2];
    path.lineTo(...end);
    ctx.save();ctx.globalAlpha=fade*reveal*0.85;ctx.strokeStyle=c.alert;
    ctx.lineWidth=0.9;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.setLineDash([length]);ctx.lineDashOffset=length*(1-reveal);ctx.stroke(path);
    if(reveal>0.92){
      const angle=Math.atan2(end[1]-previous[1],end[0]-previous[0]);
      ctx.globalAlpha=fade*0.85*ramp(reveal,0.92,0.08);ctx.fillStyle=c.alert;ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(...end);
      ctx.lineTo(end[0]-Math.cos(angle)*4+Math.sin(angle)*1.8,end[1]-Math.sin(angle)*4-Math.cos(angle)*1.8);
      ctx.lineTo(end[0]-Math.cos(angle)*4-Math.sin(angle)*1.8,end[1]-Math.sin(angle)*4+Math.cos(angle)*1.8);
      ctx.closePath();ctx.fill();
    }
    ctx.restore();
  });
  return ramp(t,4.5,1.2)*fade;
}
function IntegrationScene() {
  const { localTime } = useSprite();
  const canvasRef=React.useRef(null);
  const [furniture,setFurniture]=React.useState({});
  React.useEffect(()=>{
    let alive=true;
    loadFurniture().then(tiles=>{if(alive)setFurniture(tiles);});
    return ()=>{alive=false;};
  },[]);
  const [reducedMotion,setReducedMotion]=React.useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReducedMotion(media.matches);
    media.addEventListener('change',update); return ()=>media.removeEventListener('change',update);
  },[]);
  const t=reducedMotion?8:((localTime%CYCLE)+CYCLE)%CYCLE;
  React.useLayoutEffect(()=>{ const ctx=canvasRef.current?.getContext('2d'); if(ctx)drawHospital(ctx,t,furniture); },[t,furniture]);
  const card=activeCard(t);
  return <div style={{position:'absolute',inset:0,background:COLOR.bg}}>
    <canvas ref={canvasRef} width={W} height={H} role="img"
      aria-label="A hospital with occupied shared wards, a single room, a treatment room, an isolation room, a laboratory, reception staff and waiting visitors. The encounter chain runs from patient 1 to patient 2, then staff 1, patient 3, staff 2 and patient 4 in the bottom-left room. Patient 2 remains in bed. In the upper-right room, a patient leaves their bed, uses an already contaminated sink and then becomes infected. The completed directional transmission network remains visible for more than three seconds. A single live EHR terminal updates its patient card as hospital encounters occur and the transmission network is reconstructed."
      data-hospital-scene="integration" data-phase={t<1.4?'hospital':t<4.5?'signals':t<5.8?'integration':'reconstruction'}
      style={{width:'100%',height:'100%',imageRendering:'pixelated'}} />
    <div aria-hidden="true" style={{position:'absolute',left:1062,top:282,fontFamily:FONT_DISPLAY,fontSize:16,fontWeight:500,color:COLOR.text,pointerEvents:'none'}}>EHR</div>
    <div aria-hidden="true" style={{position:'absolute',left:1124,top:334,fontFamily:FONT_DISPLAY,fontSize:14,fontWeight:500,color:COLOR.text,opacity:ramp(t,0,0.3)*(1-ramp(t,9.4,0.3)),pointerEvents:'none'}}>{card.label}</div>
  </div>;
}
Object.assign(window,{IntegrationScene,INTEGRATION_DURATION:CYCLE});
