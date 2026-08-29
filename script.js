/* ================================================================
   script.js — Agricultural Land & Irrigation Web GIS
   Western Province, Sri Lanka | University of Moratuwa | 232313J
   ================================================================ */

/* 1. MAP */
var map = L.map('map',{center:[6.85,80.10],zoom:10,zoomControl:false});
L.control.zoom({position:'bottomright'}).addTo(map);
L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(map);

/* 2. BASEMAPS */
var BASE={
  osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom:19}),
  sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'© Esri World Imagery',maxZoom:19}),
  topo:L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{attribution:'© OpenTopoMap',maxZoom:17})
};
BASE.osm.addTo(map);
function setBase(n,b){
  Object.values(BASE).forEach(function(x){map.removeLayer(x)});
  BASE[n].addTo(map);
  document.querySelectorAll('.bm').forEach(function(x){x.classList.remove('on')});
  if(b)b.classList.add('on');
}

/* 3. POPUP */
function pr(k,v){if(v===null||v===undefined||v===''||v===0)return '';return '<div class="pr"><span class="pk">'+k+'</span><span class="pv">'+v+'</span></div>';}
function cap(s){return s?s[0].toUpperCase()+s.slice(1):'';}
function mkP(color,icon,title,rows){return '<div class="ph" style="background:'+color+'"><span>'+icon+'</span>'+title+'</div><div class="pb">'+rows+'</div>';}

/* 4. LAYERS */
var LY={wp:null,ds:null,fl:null,ca:null,dr:null,rv:null,wb:null,rp:null};
var SW={wp:true,ds:true,fl:true,ca:true,dr:true,rv:true,wb:true,rp:true};
function tog(id,row){
  var layer=LY[id];var sw=document.getElementById('sw-'+id);
  if(SW[id]){if(layer)map.removeLayer(layer);SW[id]=false;if(sw){sw.textContent='OFF';sw.classList.add('off');}if(row)row.classList.add('off');}
  else{if(layer)map.addLayer(layer);SW[id]=true;if(sw){sw.textContent='ON';sw.classList.remove('off');}if(row)row.classList.remove('off');}
}

/* 5. STATUS */
var loaded=0,TOTAL=7;
function setStatus(m){var e=document.getElementById('sbt2');if(e)e.textContent=m;}
function onLoad(name){
  loaded++;
  var bl=document.getElementById('bl');
  if(bl)bl.textContent=loaded+'/'+TOTAL+' layers';
  setStatus(loaded+'/'+TOTAL+' layers loaded');
  if(loaded>=TOTAL){
    if(bl)bl.textContent='All layers loaded ✓';
    setTimeout(function(){var b=document.getElementById('sbr');if(b)b.style.opacity='0';},2500);
  }
}

/* 6. RENDER ALL LAYERS FROM data.js */
setStatus('Loading layers…');

/* PROVINCE BOUNDARY */
(function(){
  var L1=L.geoJSON(DATA_WP,{
    style:{color:'#dc2626',weight:3.5,fill:true,fillColor:'#dc2626',fillOpacity:0.04,dashArray:'10,6',opacity:0.9},
    onEachFeature:function(f,l){
      l.bindPopup(mkP('#dc2626','🗺','Western Province',
        pr('Province','Western')+pr('Districts','Colombo · Gampaha · Kalutara')+pr('Source','OCHA/HDX ADM 2024')));
    }
  }).addTo(map);
  LY.wp=L1;
  map.fitBounds(L1.getBounds(),{padding:[22,22]});
  onLoad('Province Boundary');
})();

/* DISTRICTS */
(function(){
  var cols={'Colombo':{f:'#ede9fe',c:'#7c3aed'},'Gampaha':{f:'#dbeafe',c:'#1e40af'},'Kalutara':{f:'#dcfce7',c:'#15803d'}};
  var L2=L.geoJSON(DATA_DISTRICTS,{
    style:function(f){var cm=cols[f.properties.ADM2_EN]||{f:'#f3f4f6',c:'#6b7280'};return{color:cm.c,weight:2,fillColor:cm.f,fillOpacity:0.38,dashArray:'5,3'};},
    onEachFeature:function(f,l){
      var p=f.properties;var cm=cols[p.ADM2_EN]||{c:'#6b7280'};
      l.bindTooltip('<strong>'+p.ADM2_EN+' District</strong>',{sticky:true,direction:'top'});
      l.bindPopup(mkP(cm.c,'🏛',p.ADM2_EN+' District',pr('District',p.ADM2_EN)+pr('Province',p.ADM1_EN)+pr('P-Code',p.ADM2_PCODE)+pr('Source','OCHA/HDX ADM 2024')));
      l.on('mouseover',function(){l.setStyle({fillOpacity:0.62,weight:2.5});});
      l.on('mouseout',function(){L2.resetStyle(l);});
    }
  }).addTo(map);
  LY.ds=L2;
  onLoad('Districts');
})();

/* FARMLAND */
(function(){
  var L3=L.geoJSON(DATA_FARM,{
    style:{color:'#15803d',weight:0.8,fillColor:'#4ade80',fillOpacity:0.62},
    onEachFeature:function(f,l){
      var p=f.properties;
      l.bindPopup(mkP('#16a34a','🌾','Indicative Cropland / Farmland',
        pr('Type',cap(p.fclass)||'Farmland')+pr('Name',p.name||'—')+pr('OSM ID',p.osm_id)+pr('Source','OpenStreetMap Contributors 2024')+
        '<div class="pw">⚠ Indicative baseline — not a definitive cultivated land map</div>'));
    }
  }).addTo(map);
  LY.fl=L3;
  onLoad('Cropland');
})();

/* CANALS */
(function(){
  var L4=L.geoJSON(DATA_CANALS,{
    style:{color:'#22d3ee',weight:2.5,opacity:0.92},
    onEachFeature:function(f,l){
      var p=f.properties;
      l.bindPopup(mkP('#0891b2','💧','Irrigation Canal',
        pr('Name',p.name||'Unnamed Canal')+pr('Width',p.width&&p.width>0?p.width+' m':'—')+pr('Source','OpenStreetMap Contributors 2024')));
    }
  }).addTo(map);
  LY.ca=L4;
  onLoad('Canals');
})();

/* DRAINAGE */
(function(){
  var L5=L.geoJSON(DATA_DRAINAGE,{
    style:{color:'#67e8f9',weight:1.5,opacity:0.82,dashArray:'5,4'},
    onEachFeature:function(f,l){
      var p=f.properties;
      l.bindPopup(mkP('#164e63','🌀','Drainage',
        pr('Name',p.name||'Unnamed Drain')+pr('Source','OpenStreetMap Contributors 2024')));
    }
  }).addTo(map);
  LY.dr=L5;
  onLoad('Drainage');
})();

/* RIVERS */
(function(){
  var L6=L.geoJSON(DATA_RIVERS,{
    style:{color:'#1d4ed8',weight:2.2,opacity:0.88},
    onEachFeature:function(f,l){
      var p=f.properties;
      l.bindPopup(mkP('#1e3a8a','🌊','River / Stream',
        pr('Name',p.name||'Unnamed River')+pr('Width',p.width&&p.width>0?p.width+' m':'—')+pr('Source','OpenStreetMap Contributors 2024')));
    }
  }).addTo(map);
  LY.rv=L6;
  onLoad('Rivers');
})();

/* WATER BODIES */
(function(){
  var L7=L.geoJSON(DATA_WATER,{
    style:{color:'#1e40af',weight:1,fillColor:'#60a5fa',fillOpacity:0.65},
    onEachFeature:function(f,l){
      var p=f.properties;
      l.bindPopup(mkP('#1e40af','🌊','Water Body / Tank',
        pr('Name',p.name||'Unnamed Water Body')+pr('Type',cap(p.fclass)||'Water')+pr('Source','OpenStreetMap Contributors 2024')));
    }
  }).addTo(map);
  LY.wb=L7;
  onLoad('Water Bodies');
})();

/* PUBLIC REPORTS */
(function(){
  var RC={'Blocked Canal':'#1d4ed8','Damaged Canal':'#0369a1','Water Scarcity':'#06b6d4','Waterlogging':'#f97316','Flooding Affecting Agricultural Land':'#dc2626','Abandoned Agricultural Land':'#78350f','Agricultural Land Encroachment':'#7c3aed','Other':'#6b7280'};
  function getRC(t){return RC[t]||'#6b7280';}
  var L8=L.geoJSON(DATA_REPORTS,{
    pointToLayer:function(f,ll){return L.circleMarker(ll,{radius:9,color:'#fff',weight:2.5,fillColor:getRC(f.properties.issue_type||'Other'),fillOpacity:0.93});},
    onEachFeature:function(f,l){
      var p=f.properties;var t=p.issue_type||'Report';var isDemo=p.status==='DEMO';
      l.bindPopup(mkP(getRC(t),'📍',t,
        pr('Severity',p.severity||'')+pr('District',p.district||'')+pr('Description',p.description||'')+pr('Date',p.date||'')+
        (p.latitude&&p.longitude?pr('Coordinates',parseFloat(p.latitude).toFixed(5)+', '+parseFloat(p.longitude).toFixed(5)):'')+
        (isDemo?'<div class="pdemo">⚠ DEMO REPORT — for system demonstration only. Not a real public submission.</div>':'<div class="pw">⚠ Unverified public report — field verification required</div>')));
    }
  }).addTo(map);
  LY.rp=L8;
  var n=DATA_REPORTS.features.length;
  var br=document.getElementById('br');if(br)br.textContent=n+' reports';
  var rc=document.getElementById('rcount');if(rc)rc.textContent=n;
})();

/* 7. TABS */
function swt(id,btn){
  document.querySelectorAll('.pn').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});
  var pn=document.getElementById('p-'+id);if(pn)pn.classList.add('on');
  if(btn)btn.classList.add('on');
}

/* 8. FLY TO */
function flyTo(c,z){map.flyTo(c,z,{duration:1.2});}

/* 9. MODAL */
function openModal(){
  document.getElementById('mbg').style.display='block';
  document.getElementById('mdl').style.display='block';
  document.getElementById('idate').value=new Date().toISOString().split('T')[0];
}
function closeModal(){
  document.getElementById('mbg').style.display='none';
  document.getElementById('mdl').style.display='none';
  document.getElementById('mf').reset();
  document.getElementById('li').style.display='flex';
  document.getElementById('li').innerHTML='<span>👆</span><span>Click anywhere <strong>inside Western Province</strong> on the map to set your location pin</span>';
  document.getElementById('lc').style.display='none';
  document.getElementById('rlat').value='';document.getElementById('rlng').value='';
  document.getElementById('fb').style.display='none';
  if(pin){map.removeLayer(pin);pin=null;}
  if(pinInner){map.removeLayer(pinInner);pinInner=null;}
}

/* 10. MAP CLICK — WITH BOUNDARY VALIDATION */
var pin=null,pinInner=null,oobTimer=null;
map.on('click',function(e){
  var lat=e.latlng.lat,lng=e.latlng.lng;
  // Western Province bounding box validation
  if(lat<6.32||lat>7.34||lng<79.81||lng>80.40){
    var oob=document.getElementById('oob');
    if(oob){oob.style.display='block';clearTimeout(oobTimer);oobTimer=setTimeout(function(){oob.style.display='none';},2800);}
    document.getElementById('li').style.display='flex';
    document.getElementById('li').innerHTML='<span>⚠️</span><span style="color:#dc2626;font-weight:600">Click <strong>inside Western Province</strong> — your click was outside the boundary</span>';
    document.getElementById('lc').style.display='none';
    return;
  }
  // Valid location
  document.getElementById('rlat').value=lat.toFixed(6);
  document.getElementById('rlng').value=lng.toFixed(6);
  document.getElementById('lct').textContent='Lat: '+lat.toFixed(5)+'  ·  Lng: '+lng.toFixed(5);
  document.getElementById('lc').style.display='flex';
  document.getElementById('li').style.display='none';
  if(pin){map.removeLayer(pin);pin=null;}
  if(pinInner){map.removeLayer(pinInner);pinInner=null;}
  pin=L.circleMarker([lat,lng],{radius:14,color:'#166534',fillColor:'#166534',fillOpacity:0.15,weight:2.5}).addTo(map);
  pinInner=L.circleMarker([lat,lng],{radius:6,color:'#fff',fillColor:'#16a34a',fillOpacity:1,weight:2.5}).addTo(map);
  pin.bindPopup('<div style="font-size:12px;padding:6px 10px;font-weight:600;color:#166534;display:flex;align-items:center;gap:6px"><span>📍</span>Location set — '+lat.toFixed(4)+', '+lng.toFixed(4)+'</div>').openPopup();
});

/* 11. SUBMIT — REUSED FROM LECTURE, MODIFIED FOR ANONYMOUS WEB GIS */
var RC2={'Blocked Canal':'#1d4ed8','Damaged Canal':'#0369a1','Water Scarcity':'#06b6d4','Waterlogging':'#f97316','Flooding Affecting Agricultural Land':'#dc2626','Abandoned Agricultural Land':'#78350f','Agricultural Land Encroachment':'#7c3aed','Other':'#6b7280'};
function getRC2(t){return RC2[t]||'#6b7280';}

function submitR(){
  var it=document.getElementById('itype').value;
  var sv=document.getElementById('isev').value;
  var lat=document.getElementById('rlat').value;
  var lng=document.getElementById('rlng').value;
  var desc=document.getElementById('idesc').value.trim();
  var dur=document.getElementById('idur').value;
  var aff=document.getElementById('iaff').value;
  var role=document.getElementById('irole').value;
  var date=document.getElementById('idate').value;

  if(!it){showFB('Please select an issue type.',false);return;}
  if(!sv){showFB('Please select a severity level.',false);return;}
  if(!lat||!lng){showFB('Please click inside Western Province on the map to place your location pin first.',false);return;}

  // REUSED FROM LECTURE — copy values to hidden Google Form
  document.getElementById('g1').value=it;
  document.getElementById('g2').value=sv;
  document.getElementById('g3').value=desc;
  document.getElementById('g4').value=dur;
  document.getElementById('g5').value=aff;
  document.getElementById('g6').value=role;
  document.getElementById('g7').value=lat;
  document.getElementById('g8').value=lng;
  document.getElementById('g9').value=date;

  // REUSED FROM LECTURE — submit via hidden iframe (user stays on page)
  document.getElementById('gf').submit();
  console.log('Report submitted to Google Form ✅');

  // Add live marker immediately
  var m=L.circleMarker([parseFloat(lat),parseFloat(lng)],{radius:9,color:'#fff',weight:2.5,fillColor:getRC2(it),fillOpacity:0.93});
  m.bindPopup('<div class="ph" style="background:'+getRC2(it)+'"><span>📍</span>'+it+'</div><div class="pb">'+pr('Severity',sv)+pr('Description',desc)+pr('Date',date)+pr('Coordinates',parseFloat(lat).toFixed(5)+', '+parseFloat(lng).toFixed(5))+'<div class="pw">⚠ Unverified — just submitted</div></div>');
  m.addTo(map).openPopup();

  // Update counts
  var br=document.getElementById('br');if(br){var c=parseInt(br.textContent)||0;br.textContent=(c+1)+' reports';}
  var rc=document.getElementById('rcount');if(rc){var c2=parseInt(rc.textContent)||0;rc.textContent=(c2+1);}

  showFB('✅ Report submitted! Thank you for your contribution to agricultural planning in Western Province.',true);
  setTimeout(closeModal,2500);
}

function showFB(m,ok){
  var e=document.getElementById('fb');
  e.textContent=m;e.className=ok?'fbok':'fber';e.style.display='block';
}
