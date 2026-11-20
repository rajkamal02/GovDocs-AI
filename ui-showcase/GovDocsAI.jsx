import { useState, useRef } from "react";
const G=`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#F0F4FF;color:#0F172A}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
.outfit{font-family:'Outfit',sans-serif}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.spin{animation:spin .9s linear infinite}.fade{animation:fu .3s ease}.pulse{animation:pulse 1.5s ease infinite}
.nav-i{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:9px;cursor:pointer;font-size:13.5px;transition:all .15s;white-space:nowrap}
.nav-i:hover{background:#EFF6FF;color:#2563EB}.nav-i.on{background:#EFF6FF;color:#2563EB;font-weight:600}
.card{background:#fff;border-radius:14px;border:1px solid #E2E8F0;transition:all .2s}
.btn{border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.btn-p{background:#2563EB;color:#fff;border-radius:10px}.btn-p:hover{background:#1D4ED8;transform:translateY(-1px)}
.btn-s{background:#fff;color:#374151;border:1.5px solid #E2E8F0;border-radius:10px}.btn-s:hover{border-color:#93C5FD;color:#2563EB}
.inp{padding:10px 14px;border-radius:10px;border:1.5px solid #E2E8F0;font-family:'DM Sans',sans-serif;font-size:13.5px;outline:none;width:100%;transition:border .15s}
.inp:focus{border-color:#2563EB}.badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
.tog{width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
.tog-dot{position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;transition:left .3s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.fc:hover .fa{opacity:1;transform:translateY(0)}.fa{opacity:0;transform:translateY(4px);transition:all .2s}
.pc{transition:all .25s}.pc:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(37,99,235,.15)}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}`;
const PR=[
  {id:"ssc-cgl",name:"SSC CGL",full:"Staff Selection Commission - CGL",color:"#2563EB",bg:"#EFF6FF",cat:"Central Govt",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[{t:"Aadhaar",fmt:"PDF",mx:300},{t:"Marksheet",fmt:"PDF",mx:500}]},
  {id:"ssc-chsl",name:"SSC CHSL",full:"Staff Selection Commission - CHSL",color:"#2563EB",bg:"#EFF6FF",cat:"Central Govt",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[{t:"Aadhaar",fmt:"PDF",mx:300}]},
  {id:"ssc-mts",name:"SSC MTS",full:"Staff Selection Commission - MTS",color:"#2563EB",bg:"#EFF6FF",cat:"Central Govt",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[]},
  {id:"ssc-cpo",name:"SSC CPO",full:"SSC Central Police Organisation",color:"#1D4ED8",bg:"#EFF6FF",cat:"Police",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[]},
  {id:"upsc-cse",name:"UPSC CSE",full:"Union Public Service Commission",color:"#7C3AED",bg:"#F5F3FF",cat:"Central Govt",ph:{fmt:"JPG",mn:20,mx:300,w:350,h:350,dpi:100},sg:{fmt:"JPG",mn:10,mx:100,w:350,h:120},docs:[]},
  {id:"upsc-ies",name:"UPSC IES",full:"UPSC - Engineering Services",color:"#7C3AED",bg:"#F5F3FF",cat:"Central Govt",ph:{fmt:"JPG",mn:20,mx:300,w:350,h:350,dpi:100},sg:{fmt:"JPG",mn:10,mx:100,w:350,h:120},docs:[]},
  {id:"rrb-ntpc",name:"RRB NTPC",full:"Railway Recruitment - NTPC",color:"#0891B2",bg:"#ECFEFF",cat:"Railway",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:190,h:100},docs:[]},
  {id:"rrb-gd",name:"RRB Group D",full:"Railway Recruitment - Group D",color:"#0891B2",bg:"#ECFEFF",cat:"Railway",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:190,h:100},docs:[]},
  {id:"rrb-alp",name:"RRB ALP",full:"Railway Recruitment - ALP",color:"#0891B2",bg:"#ECFEFF",cat:"Railway",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:190,h:100},docs:[]},
  {id:"sbi-po",name:"SBI PO",full:"State Bank of India - PO",color:"#059669",bg:"#ECFDF5",cat:"Banking",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[{t:"Aadhaar",fmt:"PDF",mx:300}]},
  {id:"ibps-po",name:"IBPS PO",full:"IBPS - Probationary Officer",color:"#059669",bg:"#ECFDF5",cat:"Banking",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:4,mx:30,w:140,h:60},docs:[]},
  {id:"ibps-cl",name:"IBPS Clerk",full:"IBPS - Clerk",color:"#059669",bg:"#ECFDF5",cat:"Banking",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:4,mx:30,w:140,h:60},docs:[]},
  {id:"neet-ug",name:"NEET UG",full:"National Eligibility Entrance Test",color:"#DC2626",bg:"#FEF2F2",cat:"Entrance",ph:{fmt:"JPG",mn:10,mx:200,w:200,h:230,dpi:96},sg:{fmt:"JPG",mn:4,mx:30,w:190,h:100},docs:[]},
  {id:"jee-main",name:"JEE Main",full:"Joint Entrance Examination",color:"#EA580C",bg:"#FFF7ED",cat:"Entrance",ph:{fmt:"JPG",mn:4,mx:200,w:200,h:230,dpi:96},sg:{fmt:"JPG",mn:1,mx:30,w:200,h:80},docs:[]},
  {id:"cuet-ug",name:"CUET UG",full:"Common University Entrance Test",color:"#7C3AED",bg:"#F5F3FF",cat:"Entrance",ph:{fmt:"JPG",mn:10,mx:200,w:200,h:230,dpi:96},sg:{fmt:"JPG",mn:4,mx:30,w:200,h:80},docs:[]},
  {id:"up-police",name:"UP Police",full:"Uttar Pradesh Police Recruitment",color:"#1D4ED8",bg:"#EFF6FF",cat:"Police",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[{t:"Aadhaar",fmt:"PDF",mx:300}]},
  {id:"nda",name:"NDA",full:"National Defence Academy",color:"#374151",bg:"#F9FAFB",cat:"Defence",ph:{fmt:"JPG",mn:20,mx:40,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:5,mx:15,w:140,h:60},docs:[]},
  {id:"dsssb",name:"DSSSB",full:"Delhi Subordinate Services Board",color:"#0F766E",bg:"#F0FDFA",cat:"State Govt",ph:{fmt:"JPG",mn:20,mx:50,w:200,h:230,dpi:100},sg:{fmt:"JPG",mn:10,mx:20,w:140,h:60},docs:[]},
];
const CA={PASSPORT_PHOTO:{label:"Passport Photo",icon:"📸",color:"#3B82F6"},SIGNATURE:{label:"Signature",icon:"✍️",color:"#8B5CF6"},AADHAAR:{label:"Aadhaar",icon:"🪪",color:"#F59E0B"},PAN_CARD:{label:"PAN Card",icon:"💳",color:"#EF4444"},RESUME:{label:"Resume",icon:"📄",color:"#10B981"},CERTIFICATE:{label:"Certificate",icon:"🎓",color:"#6366F1"},MARKSHEET:{label:"Marksheet",icon:"📊",color:"#EC4899"},GOVT_ID:{label:"Govt ID",icon:"🆔",color:"#F97316"},OTHER:{label:"Other",icon:"📁",color:"#6B7280"}};
const MD=[{id:"1",name:"passport_photo.jpg",cat:"PASSPORT_PHOTO",folder:"Photos",size:45000,fmt:"jpg",date:"2024-01-15"},{id:"2",name:"signature.jpg",cat:"SIGNATURE",folder:"Signatures",size:15000,fmt:"jpg",date:"2024-01-15"},{id:"3",name:"aadhaar_card.pdf",cat:"AADHAAR",folder:"Identity",size:280000,fmt:"pdf",date:"2024-01-10"},{id:"4",name:"pan_card.jpg",cat:"PAN_CARD",folder:"Identity",size:120000,fmt:"jpg",date:"2024-01-08"},{id:"5",name:"10th_marksheet.pdf",cat:"MARKSHEET",folder:"Certificates",size:450000,fmt:"pdf",date:"2024-01-05"},{id:"6",name:"12th_marksheet.pdf",cat:"MARKSHEET",folder:"Certificates",size:380000,fmt:"pdf",date:"2024-01-05"},{id:"7",name:"graduation_cert.pdf",cat:"CERTIFICATE",folder:"Certificates",size:520000,fmt:"pdf",date:"2023-12-20"},{id:"8",name:"resume_2024.pdf",cat:"RESUME",folder:"Resume",size:180000,fmt:"pdf",date:"2024-01-12"},{id:"9",name:"birth_cert.pdf",cat:"GOVT_ID",folder:"Identity",size:210000,fmt:"pdf",date:"2023-11-15"},{id:"10",name:"caste_cert.pdf",cat:"CERTIFICATE",folder:"Certificates",size:190000,fmt:"pdf",date:"2023-10-20"}];
const fb=b=>b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const fd=d=>new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const fi=f=>["jpg","jpeg","png","webp"].includes(f)?"🖼️":f==="pdf"?"📕":"📝";
const dc=n=>{const s=n.toLowerCase();if(s.includes("photo")||s.includes("pic"))return"PASSPORT_PHOTO";if(s.includes("sign"))return"SIGNATURE";if(s.includes("aadhaar")||s.includes("aadhar"))return"AADHAAR";if(s.includes("pan"))return"PAN_CARD";if(s.includes("resume")||s.includes("cv"))return"RESUME";if(s.includes("mark")||s.includes("result"))return"MARKSHEET";if(s.includes("cert"))return"CERTIFICATE";return"OTHER";};
function Sp({s=14,c="#2563EB"}){return <div style={{width:s,height:s,border:`2px solid ${c}33`,borderTopColor:c,borderRadius:"50%",display:"inline-block"}} className="spin"/>;}
function Tg({on,set}){return <div className="tog" onClick={()=>set(!on)} style={{background:on?"#2563EB":"#E2E8F0"}}><div className="tog-dot" style={{left:on?23:3}}/></div>;}
function SC({icon,label,val,sub,bg="#EFF6FF"}){return(<div className="card" style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}><div style={{background:bg,borderRadius:10,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div><div><div className="outfit" style={{fontSize:21,fontWeight:700}}>{val}</div><div style={{fontSize:13,color:"#64748B"}}>{label}</div>{sub&&<div style={{fontSize:11,color:"#94A3B8",marginTop:1}}>{sub}</div>}</div></div>);}
function TB({title,sub,actions}){return(<div style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:"0 24px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}><div><h1 className="outfit" style={{fontSize:19,fontWeight:700}}>{title}</h1>{sub&&<p style={{fontSize:12,color:"#64748B",marginTop:1}}>{sub}</p>}</div><div style={{display:"flex",alignItems:"center",gap:8}}>{actions}<div style={{width:33,height:33,background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700,flexShrink:0}}>A</div></div></div>);}
function DLM({file,onClose}){
  const [pr,setPr]=useState(null);
  const [cfg,setCfg]=useState({format:"jpg",maxKB:50,minKB:20,width:200,height:230,dpi:96,quality:80});
  const [ps,setPs]=useState(0);const [proc,setProc]=useState(false);const [dn,setDn]=useState(false);
  const sts=["Detecting format…","Resizing to "+cfg.width+"×"+cfg.height+"…","Compressing…","Optimizing…","Finalizing…"];
  const ap=p=>{setPr(p.id);setCfg({format:p.ph.fmt.toLowerCase(),maxKB:p.ph.mx,minKB:p.ph.mn,width:p.ph.w,height:p.ph.h,dpi:p.ph.dpi,quality:80});};
  const go=async()=>{setProc(true);setPs(0);for(let i=0;i<sts.length;i++){await new Promise(r=>setTimeout(r,500));setPs(i+1);}setProc(false);setDn(true);setTimeout(()=>onClose(),1400);};
  const est=Math.min(cfg.maxKB,Math.round((cfg.width*cfg.height*3*(cfg.quality/100))/1024));
  return(
    <div className="ov" onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()} className="fade">
        <div style={{padding:"18px 22px",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><h3 className="outfit" style={{fontSize:17,fontWeight:700}}>⬇️ Smart Download</h3><p style={{fontSize:12,color:"#64748B"}}>{file?.name}</p></div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94A3B8"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{marginBottom:18}}>
            <p style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",marginBottom:9}}>Quick Presets</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {PR.slice(0,8).map(p=><button key={p.id} onClick={()=>ap(p)} className="btn" style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${pr===p.id?p.color:"#E2E8F0"}`,background:pr===p.id?p.bg:"#fff",color:pr===p.id?p.color:"#374151",fontSize:12,fontWeight:pr===p.id?600:400}}>{p.name}</button>)}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Output Format",k:"format",t:"sel",o:["jpg","png","webp","pdf"]},{l:"Quality (%)",k:"quality",t:"rng",min:10,max:100},{l:"Max Size (KB)",k:"maxKB",t:"num"},{l:"Min Size (KB)",k:"minKB",t:"num"},{l:"Width (px)",k:"width",t:"num"},{l:"Height (px)",k:"height",t:"num"},{l:"DPI",k:"dpi",t:"num"}].map(f=>(
              <div key={f.k}>
                <label style={{fontSize:12,fontWeight:500,color:"#374151",display:"block",marginBottom:4}}>{f.l}</label>
                {f.t==="sel"?<select value={cfg[f.k]} onChange={e=>setCfg({...cfg,[f.k]:e.target.value})} className="inp" style={{padding:"8px 12px"}}>{f.o.map(o=><option key={o}>{o.toUpperCase()}</option>)}</select>
                :f.t==="rng"?<div style={{display:"flex",alignItems:"center",gap:7}}><input type="range" min={f.min} max={f.max} value={cfg[f.k]} onChange={e=>setCfg({...cfg,[f.k]:+e.target.value})} style={{flex:1,accentColor:"#2563EB"}}/><span style={{fontSize:11,color:"#64748B",minWidth:28,textAlign:"right"}}>{cfg[f.k]}%</span></div>
                :<input type="number" value={cfg[f.k]} onChange={e=>setCfg({...cfg,[f.k]:+e.target.value})} className="inp" style={{padding:"8px 12px"}}/>}
              </div>
            ))}
          </div>
          <div style={{padding:"10px 14px",background:"#F0FDF4",borderRadius:9,border:"1px solid #BBF7D0",display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
            <span>✅</span><span style={{fontSize:13,color:"#15803D"}}>Estimated: ~{est} KB — within {cfg.minKB}–{cfg.maxKB} KB range</span>
          </div>
          {proc&&<div style={{padding:14,background:"#EFF6FF",borderRadius:10,marginBottom:14}}>
            {sts.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,fontSize:12.5,color:i<ps?"#16A34A":i===ps-1?"#1D4ED8":"#94A3B8"}}>{i<ps?<span>✓</span>:i===ps-1?<Sp s={12} c="#2563EB"/>:<span style={{width:12,display:"inline-block"}}/>}{s}</div>)}
          </div>}
          {dn&&<div style={{padding:13,background:"#F0FDF4",borderRadius:10,textAlign:"center",marginBottom:14,fontSize:14,color:"#15803D",fontWeight:600}}>✅ File generated! Downloading…</div>}
          <div style={{display:"flex",gap:9}}>
            <button onClick={onClose} className="btn btn-s" style={{flex:1,padding:"11px 0",fontSize:13.5}}>Cancel</button>
            <button onClick={go} disabled={proc||dn} className="btn btn-p" style={{flex:2,padding:"11px 0",fontSize:13.5,fontWeight:600}}>
              {proc?<><Sp s={14} c="#fff"/>Processing…</>:dn?"✅ Done!":"⬇️ Generate & Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function PVM({file,onClose,onDownload}){
  const c=CA[file?.cat]||CA.OTHER;
  return(
    <div className="ov" onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:500,overflow:"hidden"}} onClick={e=>e.stopPropagation()} className="fade">
        <div style={{padding:"15px 20px",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><h3 style={{fontSize:15,fontWeight:600}}>{file?.name}</h3><span style={{fontSize:12,color:"#64748B"}}>{fb(file?.size||0)} • {file?.fmt?.toUpperCase()}</span></div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94A3B8"}}>✕</button>
        </div>
        <div style={{padding:22,textAlign:"center"}}>
          <div style={{width:150,height:150,background:c.color+"15",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,margin:"0 auto 20px"}}>{fi(file?.fmt)}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"left",marginBottom:18}}>
            {[["Category",c.label],["Format",file?.fmt?.toUpperCase()],["Size",fb(file?.size||0)],["Uploaded",fd(file?.date||new Date())],["Folder",file?.folder],["Security","✅ AES-256"]].map(([k,v])=>(
              <div key={k} style={{background:"#F8FAFC",borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontSize:10.5,color:"#94A3B8",fontWeight:500,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:500}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:9}}>
            <button onClick={onClose} className="btn btn-s" style={{flex:1,padding:"10px 0",fontSize:13}}>Close</button>
            <button onClick={()=>{onDownload(file);onClose();}} className="btn btn-p" style={{flex:2,padding:"10px 0",fontSize:13,fontWeight:600}}>⬇️ Smart Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function DashP({docs,nav}){
  const tot=docs.reduce((a,d)=>a+d.size,0);
  return(<div className="fade"><TB title="Dashboard" sub="Welcome back, Arjun! 👋"/>
    <div style={{padding:22}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:22}}>
        <SC icon="🗂️" label="Total Documents" val={docs.length} sub="All folders"/>
        <SC icon="💾" label="Storage Used" val={fb(tot)} sub="of 1 GB" bg="#F5F3FF"/>
        <SC icon="⚡" label="Processed" val="23" sub="This month" bg="#ECFDF5"/>
        <SC icon="📥" label="Downloads" val="47" sub="Total" bg="#FFF7ED"/>
      </div>
      <h2 className="outfit" style={{fontSize:15,fontWeight:700,marginBottom:12}}>Quick Actions</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:11,marginBottom:22}}>
        {[{icon:"⬆️",label:"Upload Docs",page:"upload",c:"#2563EB",bg:"#EFF6FF"},{icon:"🎯",label:"Govt Presets",page:"presets",c:"#7C3AED",bg:"#F5F3FF"},{icon:"🤖",label:"AI Tools",page:"ai-tools",c:"#059669",bg:"#ECFDF5"},{icon:"📦",label:"ZIP Package",page:"packages",c:"#EA580C",bg:"#FFF7ED"}].map(a=>(
          <div key={a.page} onClick={()=>nav(a.page)} style={{background:a.bg,borderRadius:12,padding:"18px 14px",cursor:"pointer",border:`1px solid ${a.c}20`,textAlign:"center",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 16px ${a.c}25`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            <div style={{fontSize:26,marginBottom:6}}>{a.icon}</div>
            <div style={{fontSize:13,fontWeight:600,color:a.c}}>{a.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:18}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h2 className="outfit" style={{fontSize:15,fontWeight:700}}>Recent Documents</h2>
            <button onClick={()=>nav("vault")} style={{background:"none",border:"none",color:"#2563EB",fontSize:13,cursor:"pointer",fontWeight:500}}>View All →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:11}}>
            {docs.slice(0,6).map(d=>{const c=CA[d.cat]||CA.OTHER;return(
              <div key={d.id} className="card" style={{padding:11,cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#93C5FD";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2E8F0";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{height:54,background:c.color+"18",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:7}}>{fi(d.fmt)}</div>
                <div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
                <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{fb(d.size)}</div>
              </div>
            );})}
          </div>
        </div>
        <div className="card" style={{padding:16}}>
          <h3 className="outfit" style={{fontSize:14,fontWeight:700,marginBottom:13}}>Recent Activity</h3>
          {[{icon:"⬆️",text:"Uploaded passport_photo.jpg",time:"2 min ago",c:"#2563EB"},{icon:"⬇️",text:"Downloaded SSC-ready photo",time:"1 hr ago",c:"#059669"},{icon:"📦",text:"Created SSC_CGL_READY.zip",time:"3 hr ago",c:"#7C3AED"},{icon:"🤖",text:"AI detected UPSC specs",time:"1 day ago",c:"#EA580C"},{icon:"⬆️",text:"Uploaded aadhaar_card.pdf",time:"2 days ago",c:"#2563EB"},{icon:"🔗",text:"Created share link",time:"3 days ago",c:"#0891B2"}].map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:11}}>
              <div style={{width:28,height:28,background:a.c+"15",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{a.icon}</div>
              <div><div style={{fontSize:12,fontWeight:500}}>{a.text}</div><div style={{fontSize:11,color:"#94A3B8"}}>{a.time}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>);
}
function VaultP({docs,setDocs,onPrev,onDl}){
  const [vm,setVm]=useState("grid");const [q,setQ]=useState("");const [fold,setFold]=useState(null);const [cat,setCat]=useState(null);
  const fls=[...new Set(docs.map(d=>d.folder))];const fi2={"Photos":"📸","Signatures":"✍️","Identity":"🪪","Certificates":"🎓","Resume":"📄"};
  const filt=docs.filter(d=>d.name.toLowerCase().includes(q.toLowerCase())&&(!fold||d.folder===fold)&&(!cat||d.cat===cat));
  return(<div className="fade"><TB title="My Vault" sub={`${docs.length} documents — AES-256 encrypted`} actions={<button className="btn btn-p" style={{padding:"7px 14px",fontSize:13}}>⬆️ Upload</button>}/>
    <div style={{padding:22}}>
      <div style={{display:"flex",gap:10,marginBottom:17,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180,position:"relative"}}><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span><input className="inp" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search documents…" style={{paddingLeft:34}}/></div>
        <select className="inp" style={{width:"auto"}} onChange={e=>setCat(e.target.value||null)}><option value="">All Categories</option>{Object.entries(CA).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select>
        <div style={{display:"flex",gap:3,background:"#F1F5F9",borderRadius:10,padding:3}}>
          {[["grid","⊞"],["list","☰"]].map(([m,ic])=><button key={m} onClick={()=>setVm(m)} style={{padding:"6px 11px",borderRadius:8,border:"none",background:vm===m?"#fff":"transparent",cursor:"pointer",fontSize:16,boxShadow:vm===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{ic}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:17,overflowX:"auto",paddingBottom:3}}>
        {[{name:"All",icon:"📁",count:docs.length,id:null},...fls.map(f=>({name:f,icon:fi2[f]||"📁",count:docs.filter(d=>d.folder===f).length,id:f}))].map(f=>(
          <div key={f.name} onClick={()=>setFold(fold===f.id?null:f.id)} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,background:(fold===f.id)||(fold===null&&f.id===null)?"#2563EB":"#fff",color:(fold===f.id)||(fold===null&&f.id===null)?"#fff":"#374151",border:`1.5px solid ${(fold===f.id)||(fold===null&&f.id===null)?"#2563EB":"#E2E8F0"}`,cursor:"pointer",fontSize:12.5,fontWeight:500,display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
            <span>{f.icon}</span>{f.name} ({f.count})
          </div>
        ))}
        <div style={{flexShrink:0,padding:"7px 14px",borderRadius:20,background:"#fff",color:"#64748B",border:"1.5px dashed #E2E8F0",cursor:"pointer",fontSize:12.5}}>➕ New Folder</div>
      </div>
      {filt.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"#94A3B8"}}><div style={{fontSize:44,marginBottom:10}}>📂</div><div style={{fontSize:15,fontWeight:600,marginBottom:4}}>No documents found</div><div style={{fontSize:13}}>Upload new files to get started</div></div>
      :vm==="grid"?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:13}}>
        {filt.map(d=>{const c=CA[d.cat]||CA.OTHER;return(
          <div key={d.id} className="fc card" style={{overflow:"hidden",cursor:"pointer",position:"relative"}}>
            <div style={{height:90,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34}}>{fi(d.fmt)}</div>
            <div style={{padding:"9px 11px"}}><div style={{fontSize:12.5,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>{d.name}</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#94A3B8"}}>{fb(d.size)}</span><span className="badge" style={{background:c.color+"20",color:c.color}}>{d.fmt.toUpperCase()}</span></div></div>
            <div className="fa" style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(15,23,42,.88)",padding:"7px 10px",display:"flex",gap:5,justifyContent:"center"}}>
              {[{ic:"👁️",fn:()=>onPrev(d)},{ic:"⬇️",fn:()=>onDl(d)},{ic:"🗑️",fn:()=>setDocs(p=>p.filter(x=>x.id!==d.id))}].map(({ic,fn},i)=><button key={i} onClick={fn} style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",padding:"4px 7px",borderRadius:5,cursor:"pointer",fontSize:13}}>{ic}</button>)}
            </div>
          </div>
        );})}
      </div>
      :<div>{filt.map(d=>{const c=CA[d.cat]||CA.OTHER;return(
        <div key={d.id} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 14px",background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",marginBottom:5,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#93C5FD"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E2E8F0"}>
          <div style={{width:34,height:34,background:c.color+"20",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{fi(d.fmt)}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div><div style={{fontSize:12,color:"#64748B"}}>{fb(d.size)} • {fd(d.date)}</div></div>
          <span className="badge" style={{background:c.color+"20",color:c.color}}>{c.label}</span>
          <div style={{display:"flex",gap:4}}>
            {[{ic:"👁️",fn:()=>onPrev(d)},{ic:"⬇️",fn:()=>onDl(d)},{ic:"🗑️",fn:()=>setDocs(p=>p.filter(x=>x.id!==d.id))}].map(({ic,fn},i)=><button key={i} onClick={fn} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:4,borderRadius:5,opacity:.65}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.65}>{ic}</button>)}
          </div>
        </div>
      );})}
      </div>}
    </div>
  </div>);
}
function UpldP({onUploaded}){
  const [drag,setDrag]=useState(false);const [files,setFiles]=useState([]);const [upl,setUpl]=useState(false);const ref=useRef();
  const addF=raw=>{const nf=Array.from(raw).map(f=>({id:Math.random().toString(36).slice(2),name:f.name,size:f.size,fmt:f.name.split(".").pop().toLowerCase(),cat:dc(f.name),progress:0,status:"pending"}));setFiles(p=>[...p,...nf]);};
  const upload=async()=>{
    setUpl(true);
    for(let i=0;i<files.length;i++){setFiles(p=>p.map((f,idx)=>idx===i?{...f,status:"uploading"}:f));for(let p=0;p<=100;p+=20){await new Promise(r=>setTimeout(r,100));setFiles(prev=>prev.map((f,idx)=>idx===i?{...f,progress:p}:f));}setFiles(p=>p.map((f,idx)=>idx===i?{...f,status:"done",progress:100}:f));}
    setUpl(false);setTimeout(()=>{onUploaded(files.map(f=>({id:Math.random().toString(36).slice(2),name:f.name,cat:f.cat,folder:"Others",size:f.size,fmt:f.fmt,date:new Date().toISOString().split("T")[0]})));setFiles([]);},600);
  };
  return(<div className="fade"><TB title="Upload Center" sub="Upload and organize your documents securely"/>
    <div style={{padding:22}}>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);addF(e.dataTransfer.files);}} onClick={()=>ref.current?.click()}
        style={{border:`2.5px dashed ${drag?"#2563EB":"#CBD5E1"}`,borderRadius:16,padding:"44px 24px",textAlign:"center",cursor:"pointer",background:drag?"#EFF6FF":"#fff",transition:"all .3s",marginBottom:20}}>
        <div style={{fontSize:46,marginBottom:10}}>{drag?"⬇️":"☁️"}</div>
        <h3 className="outfit" style={{fontSize:18,fontWeight:700,marginBottom:7}}>{drag?"Drop to Upload!":"Drop files here"}</h3>
        <p style={{fontSize:14,color:"#64748B",marginBottom:14}}>or click to browse your device</p>
        <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>{["PDF","JPG","PNG","JPEG","WEBP","DOCX"].map(f=><span key={f} className="badge" style={{background:"#F1F5F9",color:"#64748B"}}>{f}</span>)}</div>
        <div style={{marginTop:10,fontSize:12,color:"#94A3B8"}}>Max 25MB • Unlimited uploads • AES-256 encrypted</div>
        <input ref={ref} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.docx" style={{display:"none"}} onChange={e=>addF(e.target.files)}/>
      </div>
      {files.length>0&&(<div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden",marginBottom:18}}>
        <div style={{padding:"13px 18px",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 className="outfit" style={{fontSize:14,fontWeight:700}}>{files.length} file{files.length>1?"s":""} ready</h3>{!upl&&<button onClick={()=>setFiles([])} className="btn btn-s" style={{padding:"5px 11px",fontSize:12}}>Clear All</button>}</div>
        {files.map((f,i)=>{const c=CA[f.cat]||CA.OTHER;return(
          <div key={f.id} style={{padding:"12px 18px",borderBottom:i<files.length-1?"1px solid #F1F5F9":"none",display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:33,height:33,background:c.color+"20",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{fi(f.fmt)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span><span style={{fontSize:11,color:"#94A3B8",flexShrink:0,marginLeft:6}}>{fb(f.size)}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{flex:1,height:4,background:"#F1F5F9",borderRadius:2,overflow:"hidden"}}><div style={{width:f.progress+"%",height:"100%",background:f.status==="done"?"#16A34A":"#2563EB",borderRadius:2,transition:"width .3s"}}/></div>
                {f.status==="done"?<span style={{fontSize:12,color:"#16A34A"}}>✅</span>:f.status==="uploading"?<Sp s={12}/>:<span style={{fontSize:11,color:"#94A3B8"}}>Pending</span>}
              </div>
            </div>
            <select value={f.cat} onChange={e=>setFiles(p=>p.map(fi=>fi.id===f.id?{...fi,cat:e.target.value}:fi))} style={{padding:"4px 7px",borderRadius:8,border:"1px solid #E2E8F0",fontSize:11,outline:"none"}}>{Object.entries(CA).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select>
          </div>
        );})}
        <div style={{padding:13}}><button onClick={upload} disabled={upl} className="btn btn-p" style={{width:"100%",padding:"11px 0",fontSize:14,fontWeight:600}}>{upl?<><Sp s={14} c="#fff"/>Uploading…</>:`⬆️ Upload ${files.length} File${files.length>1?"s":""}`}</button></div>
      </div>)}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:11}}>
        {[{icon:"🤖",t:"AI Auto-Detection",d:"Files auto-categorized by name & content."},{icon:"🔒",t:"Encrypted Storage",d:"AES-256 encryption immediately after upload."},{icon:"📱",t:"Access Anywhere",d:"Upload from any device, access everywhere."}].map(tip=>(
          <div key={tip.t} className="card" style={{padding:15,display:"flex",gap:11}}><span style={{fontSize:22}}>{tip.icon}</span><div><div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{tip.t}</div><div style={{fontSize:12,color:"#64748B",lineHeight:1.5}}>{tip.d}</div></div></div>
        ))}
      </div>
    </div>
  </div>);
}
function PresetP(){
  const [filter,setFilter]=useState("All");const [sel,setSel]=useState(null);const [applied,setApplied]=useState(false);
  const cats=["All",...new Set(PR.map(p=>p.cat))];
  const filt=filter==="All"?PR:PR.filter(p=>p.cat===filter);
  return(<div className="fade"><TB title="Government Presets" sub={`${PR.length} presets for all major exams`}/>
    <div style={{padding:22}}>
      <div style={{display:"flex",gap:8,marginBottom:22,overflowX:"auto",paddingBottom:3}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} className="btn" style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${filter===c?"#2563EB":"#E2E8F0"}`,background:filter===c?"#2563EB":"#fff",color:filter===c?"#fff":"#374151",fontSize:13,fontWeight:filter===c?600:400,whiteSpace:"nowrap"}}>{c}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:15}}>
        {filt.map(p=>(
          <div key={p.id} className="pc" style={{background:"#fff",borderRadius:13,border:`1.5px solid ${p.color}22`,overflow:"hidden"}}>
            <div style={{background:p.bg,padding:"15px 18px",borderBottom:`1px solid ${p.color}18`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div className="outfit" style={{fontSize:19,fontWeight:800,color:p.color}}>{p.name}</div><div style={{fontSize:12,color:"#64748B",marginTop:1}}>{p.full}</div></div>
                <span className="badge" style={{background:p.color+"20",color:p.color}}>{p.cat}</span>
              </div>
            </div>
            <div style={{padding:"12px 18px"}}>
              {[{icon:"📸",label:"Photo",val:`${p.ph.fmt} • ${p.ph.mn}–${p.ph.mx}KB • ${p.ph.w}×${p.ph.h}px`},{icon:"✍️",label:"Sign",val:`${p.sg.fmt} • ${p.sg.mn}–${p.sg.mx}KB • ${p.sg.w}×${p.sg.h}px`},...p.docs.map(d=>({icon:"📄",label:d.t,val:`${d.fmt} • max ${d.mx}KB`}))].map((r,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:6,fontSize:12,alignItems:"flex-start"}}><span style={{flexShrink:0}}>{r.icon}</span><span style={{fontWeight:600,color:"#0F172A",flexShrink:0}}>{r.label}: </span><span style={{color:"#64748B"}}>{r.val}</span></div>
              ))}
            </div>
            <div style={{padding:"11px 18px",borderTop:"1px solid #F1F5F9"}}><button onClick={()=>{setSel(p);setApplied(false);}} className="btn btn-p" style={{width:"100%",padding:"9px 0",fontSize:13,fontWeight:600}}>🎯 Apply This Preset</button></div>
          </div>
        ))}
      </div>
      {sel&&(<div className="ov" onClick={()=>setSel(null)}>
        <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:460,overflow:"hidden"}} onClick={e=>e.stopPropagation()} className="fade">
          <div style={{background:sel.bg,padding:"18px 22px",borderBottom:`1px solid ${sel.color}20`}}><h3 className="outfit" style={{fontSize:18,color:sel.color,fontWeight:800}}>{sel.name} — Apply Preset</h3><p style={{fontSize:13,color:"#64748B",marginTop:3}}>Select files from vault</p></div>
          <div style={{padding:22}}>
            {applied?<div style={{textAlign:"center",padding:"24px 0"}} className="fade"><div style={{fontSize:44,marginBottom:10}}>✅</div><h3 className="outfit" style={{fontSize:17,fontWeight:700,color:"#16A34A",marginBottom:6}}>Processing Started!</h3><p style={{fontSize:13,color:"#64748B"}}>Files being converted to {sel.name} requirements.</p></div>:<>
              {[{key:"photo",icon:"📸",label:"Passport Photo",spec:`${sel.ph.fmt} • ${sel.ph.mn}–${sel.ph.mx}KB • ${sel.ph.w}×${sel.ph.h}px`},{key:"sig",icon:"✍️",label:"Signature",spec:`${sel.sg.fmt} • ${sel.sg.mn}–${sel.sg.mx}KB • ${sel.sg.w}×${sel.sg.h}px`},...sel.docs.map(d=>({key:d.t,icon:"📄",label:d.t,spec:`${d.fmt} • max ${d.mx}KB`}))].map(item=>(
                <div key={item.key} style={{marginBottom:13}}><div style={{fontSize:12,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".04em",marginBottom:5}}>{item.icon} {item.label}</div><select className="inp" style={{padding:"9px 13px"}}><option>— Select from vault —</option><option>passport_photo.jpg ✓</option><option>signature.jpg ✓</option><option>aadhaar_card.pdf ✓</option><option>+ Upload new</option></select><div style={{fontSize:11,color:"#94A3B8",marginTop:3}}>Required: {item.spec}</div></div>
              ))}
              <div style={{padding:"10px 14px",background:"#EFF6FF",borderRadius:9,fontSize:13,color:"#1D4ED8",marginBottom:18}}>ℹ️ Files auto-converted to {sel.name} specifications.</div>
              <div style={{display:"flex",gap:9}}><button onClick={()=>setSel(null)} className="btn btn-s" style={{flex:1,padding:"11px 0",fontSize:13}}>Cancel</button><button onClick={()=>setApplied(true)} className="btn btn-p" style={{flex:2,padding:"11px 0",fontSize:13,fontWeight:600}}>⚡ Process & Download</button></div>
            </>}
          </div>
        </div>
      </div>)}
    </div>
  </div>);
}
function AIReqP(){
  const [text,setText]=useState("");const [img,setImg]=useState(null);const [loading,setLoading]=useState(false);const [result,setResult]=useState(null);const [err,setErr]=useState(null);const ref=useRef();
  const detect=async()=>{
    if(!text.trim()&&!img)return;setLoading(true);setErr(null);setResult(null);
    try{
      const content=[...(img?[{type:"image",source:{type:"base64",media_type:img.type,data:img.data}}]:[]),{type:"text",text:`You are an Indian government exam document requirements extractor. Extract EXACT specs. Return ONLY valid JSON (no markdown):\n{"photo":{"format":"jpg","minKB":20,"maxKB":50,"width":200,"height":230,"background":"white","dpi":96},"signature":{"format":"jpg","minKB":10,"maxKB":20,"width":140,"height":60},"documents":[{"type":"Aadhaar","format":"pdf","maxKB":300}],"exam":"exam name or null","notes":"notes or null"}\nUse null for missing. Input: ${text}`}];
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content}]})});
      const data=await res.json();setResult(JSON.parse((data.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim()));
    }catch(e){setErr("Could not detect. Try clearer text or better screenshot.");}setLoading(false);
  };
  const handleImg=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setImg({data:r.result.split(",")[1],type:f.type,name:f.name});r.readAsDataURL(f);};
  return(<div className="fade"><TB title="AI Requirement Detector" sub="Paste text or screenshot — AI extracts specs automatically"/>
    <div style={{padding:22}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #E2E8F0",background:"#F8FAFF"}}><h3 className="outfit" style={{fontSize:14,fontWeight:700}}>📋 Input Requirements</h3><p style={{fontSize:12,color:"#64748B",marginTop:2}}>Paste notification text or upload screenshot</p></div>
          <div style={{padding:18}}>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={"Paste notification text here...\n\nExample:\nPhotograph: Recent passport size photo, JPEG, 20KB–50KB, 200×230 pixels, white background.\n\nSignature: Black ink on white, JPEG, 10KB–20KB, 140×60 pixels."} style={{width:"100%",minHeight:200,padding:12,borderRadius:10,border:"1.5px solid #E2E8F0",fontSize:13,lineHeight:1.6,resize:"vertical",outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            <div style={{margin:"11px 0",textAlign:"center",color:"#94A3B8",fontSize:13}}>— OR —</div>
            <div onClick={()=>ref.current?.click()} style={{border:"1.5px dashed #CBD5E1",borderRadius:10,padding:14,textAlign:"center",cursor:"pointer",background:img?"#F0FDF4":"#F8FAFF"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#2563EB"} onMouseLeave={e=>e.currentTarget.style.borderColor="#CBD5E1"}>
              {img?<><div style={{fontSize:20}}>✅</div><div style={{fontSize:13,color:"#16A34A",fontWeight:500,marginTop:3}}>{img.name}</div></>:<><div style={{fontSize:28}}>🖼️</div><div style={{fontSize:13,color:"#64748B",marginTop:4}}>Upload screenshot of requirements</div></>}
              <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
            </div>
            {img&&<button onClick={()=>setImg(null)} style={{marginTop:6,fontSize:12,color:"#EF4444",background:"none",border:"none",cursor:"pointer"}}>✕ Remove</button>}
            <button onClick={detect} disabled={loading||(!text.trim()&&!img)} className="btn btn-p" style={{width:"100%",marginTop:14,padding:"12px 0",fontSize:14,fontWeight:600}}>{loading?<><Sp s={15} c="#fff"/>Detecting…</>:"🤖 Detect Requirements with AI"}</button>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #E2E8F0",background:"#F8FAFF"}}><h3 className="outfit" style={{fontSize:14,fontWeight:700}}>✅ Detected Specifications</h3><p style={{fontSize:12,color:"#64748B",marginTop:2}}>AI-extracted document requirements</p></div>
          <div style={{padding:18}}>
            {loading&&<div style={{textAlign:"center",padding:"36px 0"}}><Sp s={30}/><div style={{fontSize:13,color:"#64748B",marginTop:11}}>Analyzing requirements…</div>{["Reading text…","Identifying doc types…","Extracting specs…","Formatting…"].map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,justifyContent:"center",marginTop:7,fontSize:12,color:"#94A3B8"}}><div style={{width:5,height:5,background:"#2563EB",borderRadius:"50%"}} className="pulse"/>{s}</div>)}</div>}
            {err&&<div style={{padding:14,background:"#FEF2F2",borderRadius:9,color:"#DC2626",fontSize:13}}>⚠️ {err}</div>}
            {!loading&&!err&&!result&&<div style={{textAlign:"center",padding:"36px 16px",color:"#94A3B8"}}><div style={{fontSize:44,marginBottom:10}}>🤖</div><div style={{fontSize:14,fontWeight:500,marginBottom:4}}>Waiting for input</div><div style={{fontSize:12}}>Paste text and click Detect</div></div>}
            {result&&<div className="fade">
              {result.exam&&<div style={{padding:"7px 12px",background:"#EFF6FF",borderRadius:8,fontSize:13,color:"#2563EB",fontWeight:600,marginBottom:14}}>🎯 Detected: {result.exam}</div>}
              {[{key:"photo",label:"📸 Passport Photo",data:result.photo},{key:"sig",label:"✍️ Signature",data:result.signature}].filter(s=>s.data&&Object.values(s.data).some(v=>v!==null)).map(sec=>(
                <div key={sec.key} style={{marginBottom:12,padding:13,background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}>
                  <div style={{fontWeight:700,fontSize:13.5,marginBottom:9}}>{sec.label}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                    {Object.entries(sec.data).filter(([,v])=>v!==null).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:"#64748B",textTransform:"capitalize"}}>{k}:</span><span style={{fontWeight:600}}>{String(v)}</span></div>)}
                  </div>
                </div>
              ))}
              {result.documents?.length>0&&<div style={{marginBottom:12,padding:13,background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}><div style={{fontWeight:700,fontSize:13.5,marginBottom:8}}>📄 Documents</div>{result.documents.map((d,i)=><div key={i} style={{fontSize:12,marginBottom:3}}><span style={{fontWeight:600}}>{d.type}: </span><span style={{color:"#64748B"}}>{d.format?.toUpperCase()} • max {d.maxKB}KB</span></div>)}</div>}
              {result.notes&&<div style={{padding:"9px 12px",background:"#FFFBEB",borderRadius:8,fontSize:12,color:"#92400E",border:"1px solid #FDE68A",marginBottom:14}}>💡 {result.notes}</div>}
              <div style={{display:"flex",gap:7}}><button className="btn btn-s" style={{flex:1,padding:"9px 0",fontSize:12.5}}>💾 Save Preset</button><button className="btn btn-p" style={{flex:2,padding:"9px 0",fontSize:12.5}}>⚡ Apply Settings</button></div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  </div>);
}
function AIPhotoP(){
  const [uploaded,setUploaded]=useState(false);const [proc,setProc]=useState(false);const [done,setDone]=useState(false);const [steps,setSteps]=useState([]);
  const [cfg,setCfg]=useState({bg:"white",brightness:10,contrast:5,width:200,height:230,targetKB:40,format:"jpg"});const ref=useRef();
  const go=async()=>{setProc(true);setSteps([]);for(const s of["🔍 Detecting face…","✂️ Auto-cropping…","🎨 Adding white background…","☀️ Adjusting brightness…",`📐 Resizing to ${cfg.width}×${cfg.height}px…`,`🗜️ Compressing to ~${cfg.targetKB}KB…`]){await new Promise(r=>setTimeout(r,500));setSteps(p=>[...p,s]);}setProc(false);setDone(true);};
  return(<div className="fade"><TB title="Passport Photo Enhancer" sub="AI-powered photo optimization for government portals"/>
    <div style={{padding:22}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <div>
        <div className="card" style={{padding:18,marginBottom:14}}>
          <h3 className="outfit" style={{fontSize:14,fontWeight:700,marginBottom:12}}>⬆️ Upload Photo</h3>
          <div onClick={()=>ref.current?.click()} style={{border:"2px dashed #CBD5E1",borderRadius:10,padding:22,textAlign:"center",cursor:"pointer",background:uploaded?"#F0FDF4":"#F8FAFF"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#2563EB"} onMouseLeave={e=>e.currentTarget.style.borderColor="#CBD5E1"}>
            {uploaded?<><div style={{fontSize:28}}>✅</div><div style={{fontSize:13,color:"#16A34A",fontWeight:600,marginTop:4}}>Photo uploaded!</div></>:<><div style={{fontSize:36}}>📸</div><div style={{fontSize:13,color:"#64748B",marginTop:5}}>Click to upload photo</div></>}
            <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={()=>setUploaded(true)}/>
          </div>
        </div>
        <div className="card" style={{padding:18,marginBottom:14}}>
          <h3 className="outfit" style={{fontSize:14,fontWeight:700,marginBottom:13}}>⚙️ Enhancement Settings</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[{l:"Background",k:"bg",t:"sel",o:["white","light_grey","transparent"]},{l:"Brightness",k:"brightness",t:"rng",min:-50,max:50},{l:"Contrast",k:"contrast",t:"rng",min:-50,max:50},{l:"Width (px)",k:"width",t:"num"},{l:"Height (px)",k:"height",t:"num"},{l:"Target KB",k:"targetKB",t:"num"},{l:"Format",k:"format",t:"sel",o:["jpg","png","webp"]}].map(f=>(
              <div key={f.k} style={{display:"flex",alignItems:"center",gap:9}}>
                <label style={{fontSize:12.5,color:"#374151",fontWeight:500,width:110,flexShrink:0}}>{f.l}</label>
                {f.t==="sel"?<select value={cfg[f.k]} onChange={e=>setCfg({...cfg,[f.k]:e.target.value})} className="inp" style={{flex:1,padding:"7px 10px"}}>{f.o.map(o=><option key={o}>{o}</option>)}</select>
                :f.t==="rng"?<div style={{flex:1,display:"flex",alignItems:"center",gap:7}}><input type="range" min={f.min} max={f.max} value={cfg[f.k]} onChange={e=>setCfg({...cfg,[f.k]:+e.target.value})} style={{flex:1,accentColor:"#2563EB"}}/><span style={{fontSize:11,color:"#64748B",minWidth:24,textAlign:"right"}}>{cfg[f.k]}</span></div>
                :<input type="number" value={cfg[f.k]} onChange={e=>setCfg({...cfg,[f.k]:+e.target.value})} className="inp" style={{flex:1,padding:"7px 10px"}}/>}
              </div>
            ))}
          </div>
          <div style={{marginTop:12}}><div style={{fontSize:11,color:"#64748B",fontWeight:600,marginBottom:7,textTransform:"uppercase",letterSpacing:".04em"}}>Quick Presets</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{n:"SSC",w:200,h:230},{n:"UPSC",w:350,h:350},{n:"Visa",w:250,h:350},{n:"NDA",w:200,h:230}].map(p=><button key={p.n} onClick={()=>setCfg({...cfg,width:p.w,height:p.h})} className="btn btn-s" style={{padding:"4px 11px",fontSize:12}}>{p.n}</button>)}</div></div>
        </div>
        <button onClick={go} disabled={!uploaded||proc} className="btn btn-p" style={{width:"100%",padding:"12px 0",fontSize:14,fontWeight:600}}>{proc?<><Sp s={15} c="#fff"/>Enhancing…</>:"✨ Enhance Photo"}</button>
      </div>
      <div className="card" style={{padding:18}}>
        <h3 className="outfit" style={{fontSize:14,fontWeight:700,marginBottom:14}}>👁️ Before / After Preview</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:18}}>
          {[{l:"Original",bg:"#F1F5F9",ic:"📸",ok:false},{l:"Enhanced",bg:done?"#F0FDF4":"#F8FAFF",ic:done?"✅":"⏳",ok:done}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}><div style={{background:s.bg,borderRadius:10,height:130,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,marginBottom:5,border:s.ok?"2px solid #BBF7D0":"1px solid #E2E8F0"}}>{s.ic}</div><div style={{fontSize:12,color:s.ok?"#16A34A":"#64748B",fontWeight:500}}>{s.l}</div></div>
          ))}
        </div>
        {steps.length>0&&<div style={{background:"#F8FAFC",borderRadius:10,padding:13,marginBottom:14}}>{steps.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,fontSize:12.5,color:"#374151"}}><span style={{color:"#16A34A"}}>✓</span>{s}</div>)}{proc&&<div style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#2563EB"}}><Sp s={11}/>Processing…</div>}</div>}
        {done&&<div><div style={{padding:"11px 14px",background:"#F0FDF4",borderRadius:10,marginBottom:12,fontSize:13,color:"#15803D"}}><div style={{fontWeight:700,marginBottom:3}}>✅ Complete!</div><div>Output: {cfg.width}×{cfg.height}px • ~{cfg.targetKB}KB • {cfg.format.toUpperCase()}</div></div><div style={{display:"flex",gap:7}}><button className="btn btn-s" style={{flex:1,padding:"9px 0",fontSize:13}}>💾 Save</button><button className="btn btn-p" style={{flex:1,padding:"9px 0",fontSize:13}}>⬇️ Download</button></div></div>}
        {!uploaded&&!done&&<div style={{textAlign:"center",padding:"24px 0",color:"#94A3B8",fontSize:13}}>Upload a photo to see preview</div>}
      </div>
    </div></div>
  </div>);
}
function AISignP(){
  const [uploaded,setUploaded]=useState(false);const [proc,setProc]=useState(false);const [done,setDone]=useState(false);
  const [cfg,setCfg]=useState({removeBg:true,darken:40,smooth:true,width:140,height:60,targetKB:15,format:"jpg"});const ref=useRef();
  const go=async()=>{setProc(true);await new Promise(r=>setTimeout(r,2200));setProc(false);setDone(true);};
  return(<div className="fade"><TB title="Signature Cleaner" sub="Remove background, enhance ink, optimize for portals"/>
    <div style={{padding:22}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <div>
        <div className="card" style={{padding:18,marginBottom:14}}>
          <div onClick={()=>ref.current?.click()} style={{border:"2px dashed #CBD5E1",borderRadius:10,padding:22,textAlign:"center",cursor:"pointer",background:uploaded?"#F0FDF4":"#F8FAFF"}}>
            {uploaded?<><div style={{fontSize:28}}>✅</div><div style={{fontSize:13,color:"#16A34A",fontWeight:600,marginTop:4}}>Signature uploaded!</div></>:<><div style={{fontSize:36}}>✍️</div><div style={{fontSize:13,color:"#64748B",marginTop:5}}>Click to upload signature</div></>}
            <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={()=>setUploaded(true)}/>
          </div>
        </div>
        <div className="card" style={{padding:18,marginBottom:14}}>
          <h3 className="outfit" style={{fontSize:14,fontWeight:700,marginBottom:13}}>⚙️ Cleaning Settings</h3>
          {[{l:"Remove Background",k:"removeBg"},{l:"Smooth Edges",k:"smooth"}].map(f=><div key={f.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"10px 13px",background:"#F8FAFC",borderRadius:9}}><span style={{fontSize:13,fontWeight:500}}>{f.l}</span><Tg on={cfg[f.k]} set={v=>setCfg({...cfg,[f.k]:v})}/></div>)}
          <div style={{marginBottom:13}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,fontWeight:500}}>🖊️ Darken Ink</span><span style={{fontSize:12,color:"#64748B"}}>{cfg.darken}%</span></div><input type="range" min={0} max={100} value={cfg.darken} onChange={e=>setCfg({...cfg,darken:+e.target.value})} style={{width:"100%",accentColor:"#2563EB"}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>{[["Width (px)","width"],["Height (px)","height"],["Target KB","targetKB"]].map(([l,k])=><div key={k}><div style={{fontSize:12,fontWeight:500,marginBottom:4}}>{l}</div><input type="number" value={cfg[k]} onChange={e=>setCfg({...cfg,[k]:+e.target.value})} className="inp" style={{padding:"7px 10px"}}/></div>)}</div>
        </div>
        <button onClick={go} disabled={!uploaded||proc} className="btn btn-p" style={{width:"100%",padding:"12px 0",fontSize:14,fontWeight:600}}>{proc?<><Sp s={15} c="#fff"/>Cleaning…</>:"🧹 Clean Signature"}</button>
      </div>
      <div className="card" style={{padding:18}}>
        <h3 className="outfit" style={{fontSize:14,fontWeight:700,marginBottom:14}}>👁️ Before / After</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
          {[{l:"Before",bg:"#F1F5F9",ic:"✍️",ok:false},{l:"After",bg:done?"#F0FDF4":"#F8FAFF",ic:done?"✅":"⏳",ok:done}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}><div style={{background:s.bg,borderRadius:10,height:70,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:5,border:s.ok?"2px solid #BBF7D0":"1px solid #E2E8F0"}}>{s.ic}</div><div style={{fontSize:12,color:s.ok?"#16A34A":"#64748B",fontWeight:500}}>{s.l}</div></div>
          ))}
        </div>
        {proc&&<div style={{padding:14,background:"#EFF6FF",borderRadius:10,textAlign:"center"}}><Sp s={22}/><div style={{fontSize:13,color:"#2563EB",marginTop:7}}>Removing background & enhancing…</div></div>}
        {done&&<div><div style={{padding:"11px 14px",background:"#F0FDF4",borderRadius:10,marginBottom:12,fontSize:13,color:"#15803D"}}><div style={{fontWeight:700,marginBottom:3}}>✅ Cleaned!</div><div>Output: {cfg.width}×{cfg.height}px • ~{cfg.targetKB}KB</div></div><div style={{display:"flex",gap:7}}><button className="btn btn-s" style={{flex:1,padding:"9px 0",fontSize:13}}>💾 Save</button><button className="btn btn-p" style={{flex:1,padding:"9px 0",fontSize:13}}>⬇️ Download</button></div></div>}
      </div>
    </div></div>
  </div>);
}
function AIToolsHub({nav}){
  return(<div className="fade"><TB title="AI Tools" sub="Intelligent document processing powered by AI"/>
    <div style={{padding:22}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18}}>
        {[{icon:"🤖",t:"AI Requirement Detector",d:"Paste notification text or screenshot. AI extracts photo size, format, dimensions automatically.",page:"ai-req",color:"#2563EB",bg:"#EFF6FF",feats:["Paste text or upload image","Detects all document specs","Save as custom preset","Works with any portal"]},
          {icon:"📸",t:"Passport Photo Enhancer",d:"Auto-crop, center face, white background, adjust brightness, compress to portal specs.",page:"ai-photo",color:"#7C3AED",bg:"#F5F3FF",feats:["AI face detection","White background","Brightness tuning","Precise size targeting"]},
          {icon:"✍️",t:"Signature Cleaner",d:"Remove background, darken ink, smooth edges, and compress to exact portal requirements.",page:"ai-sign",color:"#059669",bg:"#ECFDF5",feats:["Background removal","Ink enhancement","Edge smoothing","Portal optimization"]}
        ].map(t=>(
          <div key={t.t} className="card" style={{overflow:"hidden"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 8px 24px ${t.color}20`;e.currentTarget.style.borderColor=t.color+"40";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#E2E8F0";}}>
            <div style={{background:t.bg,padding:"22px 22px 18px"}}><div style={{fontSize:38,marginBottom:10}}>{t.icon}</div><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:7}}>{t.t}</h3><p style={{fontSize:13,color:"#64748B",lineHeight:1.6}}>{t.d}</p></div>
            <div style={{padding:"14px 22px"}}>{t.feats.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,fontSize:13,color:"#374151"}}><span style={{color:t.color}}>✓</span>{f}</div>)}<button onClick={()=>nav(t.page)} className="btn btn-p" style={{width:"100%",padding:"10px 0",fontSize:13.5,fontWeight:600,marginTop:12,background:t.color}}>Open Tool →</button></div>
          </div>
        ))}
      </div>
    </div>
  </div>);
}
function DlP(){
  const dl=[{id:1,name:"photo_ssc_ready.jpg",orig:"passport_photo.jpg",preset:"SSC CGL",size:38,date:"2024-01-15 14:32"},{id:2,name:"signature_upsc.jpg",orig:"signature.jpg",preset:"UPSC CSE",size:22,date:"2024-01-14 10:15"},{id:3,name:"photo_neet.jpg",orig:"passport_photo.jpg",preset:"NEET UG",size:45,date:"2024-01-13 09:00"},{id:4,name:"aadhaar_compressed.pdf",orig:"aadhaar_card.pdf",preset:"Custom",size:185,date:"2024-01-12 16:45"},{id:5,name:"photo_jee.jpg",orig:"passport_photo.jpg",preset:"JEE Main",size:28,date:"2024-01-11 11:20"},{id:6,name:"sig_sbi.jpg",orig:"signature.jpg",preset:"SBI PO",size:18,date:"2024-01-10 08:30"}];
  return(<div className="fade"><TB title="Download History" sub="All generated and downloaded files"/>
    <div style={{padding:22}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:13,marginBottom:22}}>
        <SC icon="📥" label="Total Downloads" val="47"/><SC icon="⚡" label="This Month" val="23" bg="#F5F3FF"/><SC icon="💾" label="Data Generated" val="12 MB" bg="#ECFDF5"/>
      </div>
      <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 className="outfit" style={{fontSize:14,fontWeight:700}}>Recent Downloads</h3><button className="btn btn-s" style={{padding:"5px 13px",fontSize:12}}>Export CSV</button></div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>{["Generated File","Original","Preset","Size","Date","Action"].map(h=><th key={h} style={{padding:"9px 15px",textAlign:"left",fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".04em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{dl.map(d=><tr key={d.id} style={{borderTop:"1px solid #F1F5F9"}} onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><td style={{padding:"11px 15px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:15}}>📄</span><span style={{fontSize:13,fontWeight:500}}>{d.name}</span></div></td><td style={{padding:"11px 15px",fontSize:13,color:"#64748B"}}>{d.orig}</td><td style={{padding:"11px 15px"}}><span className="badge" style={{background:"#EFF6FF",color:"#2563EB"}}>{d.preset}</span></td><td style={{padding:"11px 15px",fontSize:13,color:"#64748B"}}>{d.size} KB</td><td style={{padding:"11px 15px",fontSize:12,color:"#64748B",whiteSpace:"nowrap"}}>{d.date}</td><td style={{padding:"11px 15px"}}><button style={{background:"#EFF6FF",border:"none",color:"#2563EB",padding:"5px 10px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⬇️ Re-download</button></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>);
}
function PkgP(){
  const [step,setStep]=useState(1);const [sel,setSel]=useState(null);const [gen,setGen]=useState(false);const [done,setDone]=useState(false);const [gs,setGs]=useState(0);
  const gsteps=["Processing passport_photo.jpg…","Resizing to exact dimensions…","Compressing to target size…","Processing signature.jpg…","Compressing aadhaar.pdf…","Creating ZIP package…"];
  const generate=async()=>{setGen(true);setGs(0);for(let i=0;i<gsteps.length;i++){await new Promise(r=>setTimeout(r,500));setGs(i+1);}setGen(false);setDone(true);};
  return(<div className="fade"><TB title="Package Generator" sub="Create complete government-ready ZIP packages"/>
    <div style={{padding:22}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:26}}>
        {[{n:1,l:"Choose Exam"},{n:2,l:"Assign Files"},{n:3,l:"Preview"},{n:4,l:"Generate"}].map((s,i)=>(
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}} onClick={()=>step>=s.n&&setStep(s.n)}>
              <div style={{width:28,height:28,borderRadius:"50%",background:step>=s.n?"#2563EB":"#E2E8F0",color:step>=s.n?"#fff":"#94A3B8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,transition:"all .3s"}}>{step>s.n?"✓":s.n}</div>
              <span style={{fontSize:13,fontWeight:step===s.n?600:400,color:step>=s.n?"#0F172A":"#94A3B8"}}>{s.l}</span>
            </div>
            {i<3&&<div style={{flex:1,height:2,background:step>s.n?"#2563EB":"#E2E8F0",margin:"0 9px",minWidth:20,transition:"all .3s"}}/>}
          </div>
        ))}
      </div>
      {step===1&&<div><h3 className="outfit" style={{fontSize:15,fontWeight:700,marginBottom:14}}>Select Exam / Portal</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>{PR.map(p=><div key={p.id} onClick={()=>{setSel(p);setStep(2);}} style={{padding:"13px 16px",borderRadius:11,border:`2px solid ${sel?.id===p.id?p.color:"#E2E8F0"}`,background:sel?.id===p.id?p.bg:"#fff",cursor:"pointer",transition:"all .2s",textAlign:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor=p.color} onMouseLeave={e=>{if(sel?.id!==p.id)e.currentTarget.style.borderColor="#E2E8F0";}}><div className="outfit" style={{fontWeight:700,fontSize:14,color:p.color}}>{p.name}</div><div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{p.cat}</div></div>)}</div></div>}
      {step===2&&sel&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 className="outfit" style={{fontSize:15,fontWeight:700}}>Assign Files for {sel.name}</h3><button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:"#64748B",fontSize:13,cursor:"pointer"}}>← Back</button></div>
        <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",overflow:"hidden"}}>
          {[{key:"photo",icon:"📸",label:"Passport Photo",spec:`${sel.ph.fmt} • ${sel.ph.mn}–${sel.ph.mx}KB • ${sel.ph.w}×${sel.ph.h}px`},{key:"sig",icon:"✍️",label:"Signature",spec:`${sel.sg.fmt} • ${sel.sg.mn}–${sel.sg.mx}KB • ${sel.sg.w}×${sel.sg.h}px`},...sel.docs.map(d=>({key:d.t,icon:"📄",label:d.t,spec:`${d.fmt} • max ${d.mx}KB`}))].map((item,i,arr)=>(
            <div key={item.key} style={{padding:"14px 18px",borderBottom:i<arr.length-1?"1px solid #F1F5F9":"none",display:"flex",alignItems:"center",gap:13}}>
              <span style={{fontSize:26}}>{item.icon}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5,marginBottom:2}}>{item.label}</div><div style={{fontSize:12,color:"#64748B"}}>Required: {item.spec}</div></div>
              <select className="inp" style={{width:"auto",minWidth:190,padding:"8px 12px"}}><option>— Select from vault —</option><option>passport_photo.jpg ✓</option><option>signature.jpg ✓</option><option>aadhaar_card.pdf ✓</option><option>+ Upload new</option></select>
            </div>
          ))}
        </div>
        <button onClick={()=>setStep(3)} className="btn btn-p" style={{marginTop:14,padding:"11px 28px",fontSize:14,fontWeight:600}}>Preview Package →</button>
      </div>}
      {step===3&&sel&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 className="outfit" style={{fontSize:15,fontWeight:700}}>Package Preview — {sel.name}</h3><button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:"#64748B",fontSize:13,cursor:"pointer"}}>← Back</button></div>
        <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",padding:18,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14,padding:"11px 14px",background:"#F8FAFC",borderRadius:9}}><span style={{fontSize:26}}>📦</span><div><div style={{fontWeight:700,fontSize:14}}>{sel.name}_READY.zip</div><div style={{fontSize:12,color:"#64748B"}}>3 files • ~240 KB total</div></div><span className="badge" style={{marginLeft:"auto",background:"#F0FDF4",color:"#16A34A"}}>Ready ✓</span></div>
          {[{n:"photo.jpg",s:"38 KB",spec:`${sel.ph.w}×${sel.ph.h}px`},{n:"signature.jpg",s:"15 KB",spec:`${sel.sg.w}×${sel.sg.h}px`},{n:"aadhaar.pdf",s:"185 KB",spec:"Compressed"}].map(f=><div key={f.n} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}><span style={{fontSize:18}}>{fi(f.n.split(".").pop())}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{f.n}</div><div style={{fontSize:12,color:"#64748B"}}>{f.s} • {f.spec}</div></div><span>✅</span></div>)}
        </div>
        <button onClick={()=>setStep(4)} className="btn btn-p" style={{padding:"11px 28px",fontSize:14,fontWeight:600}}>Generate Package →</button>
      </div>}
      {step===4&&<div style={{textAlign:"center",padding:"24px 0"}}>
        {!gen&&!done&&<><div style={{fontSize:58,marginBottom:14}}>📦</div><h3 className="outfit" style={{fontSize:19,fontWeight:700,marginBottom:7}}>Ready to Generate!</h3><p style={{fontSize:14,color:"#64748B",marginBottom:22}}>Your {sel?.name} package with all formatted documents.</p><button onClick={generate} className="btn btn-p" style={{padding:"13px 36px",fontSize:15,fontWeight:600}}>⚡ Generate ZIP Package</button></>}
        {gen&&<><div style={{fontSize:58,marginBottom:14}}>⚙️</div><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:18}}>Preparing package…</h3>{gsteps.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:7,fontSize:13,color:i<gs?"#16A34A":i===gs-1?"#2563EB":"#94A3B8"}}>{i<gs?<span>✓</span>:i===gs-1?<Sp s={12}/>:<span style={{width:12,display:"inline-block"}}/>}{s}</div>)}</>}
        {done&&<div className="fade"><div style={{fontSize:58,marginBottom:14}}>🎉</div><h3 className="outfit" style={{fontSize:21,fontWeight:800,marginBottom:7,color:"#16A34A"}}>Package Ready!</h3><p style={{fontSize:14,color:"#64748B",marginBottom:22}}>{sel?.name}_READY.zip is ready!</p><button className="btn btn-p" style={{padding:"13px 36px",fontSize:15,fontWeight:700,display:"inline-flex",gap:8}}>⬇️ Download {sel?.name}_READY.zip</button><div style={{marginTop:14}}><button onClick={()=>{setStep(1);setSel(null);setDone(false);setGen(false);}} style={{background:"none",border:"none",color:"#2563EB",fontSize:13,cursor:"pointer"}}>Create another →</button></div></div>}
      </div>}
    </div>
  </div>);
}
function ShareP(){
  const [show,setShow]=useState(false);const [exp,setExp]=useState("24h");const [pw,setPw]=useState(false);const [created,setCreated]=useState(false);const [link,setLink]=useState("");const [copied,setCopied]=useState(false);
  const links=[{id:1,file:"passport_photo.jpg",token:"govdocs.ai/s/abc123",expires:"24 hours",views:"3/10",active:true},{id:2,file:"SSC_CGL_READY.zip",token:"govdocs.ai/s/xyz789",expires:"7 days",views:"1/∞",active:true},{id:3,file:"resume_2024.pdf",token:"govdocs.ai/s/def456",expires:"Expired",views:"5/5",active:false}];
  const create=async()=>{await new Promise(r=>setTimeout(r,700));setLink("govdocs.ai/s/"+Math.random().toString(36).slice(2,9));setCreated(true);};
  return(<div className="fade"><TB title="Share Center" sub="Create secure, expiring links for your documents" actions={<button onClick={()=>setShow(true)} className="btn btn-p" style={{padding:"7px 14px",fontSize:13}}>🔗 New Link</button>}/>
    <div style={{padding:22}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:13,marginBottom:22}}>
        <SC icon="🔗" label="Active Links" val="2" bg="#EFF6FF"/><SC icon="👁️" label="Total Views" val="9" bg="#F5F3FF"/><SC icon="🔒" label="Protected" val="1" bg="#FFF7ED"/>
      </div>
      <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #E2E8F0"}}><h3 className="outfit" style={{fontSize:14,fontWeight:700}}>Share Links</h3></div>
        {links.map((l,i)=><div key={l.id} style={{padding:"13px 18px",borderBottom:i<links.length-1?"1px solid #F1F5F9":"none",display:"flex",alignItems:"center",gap:13}} onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><span style={{fontSize:22}}>🔗</span><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13.5}}>{l.file}</div><div style={{fontSize:12,color:"#64748B",marginTop:1}}>{l.token} • Expires: {l.expires} • Views: {l.views}</div></div><span className="badge" style={{background:l.active?"#F0FDF4":"#FEF2F2",color:l.active?"#16A34A":"#DC2626"}}>{l.active?"active":"expired"}</span><div style={{display:"flex",gap:6}}>{l.active&&<button style={{background:"#EFF6FF",border:"none",color:"#2563EB",padding:"5px 10px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>📋 Copy</button>}<button style={{background:"none",border:"1px solid #E2E8F0",color:"#64748B",padding:"5px 10px",borderRadius:6,fontSize:12,cursor:"pointer"}}>🗑️</button></div></div>)}
      </div>
      {show&&<div className="ov" onClick={()=>{setShow(false);setCreated(false);setLink("");}}>
        <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:430,overflow:"hidden"}} onClick={e=>e.stopPropagation()} className="fade">
          <div style={{padding:"18px 22px",borderBottom:"1px solid #E2E8F0"}}><h3 className="outfit" style={{fontSize:17,fontWeight:700}}>Create Share Link</h3></div>
          <div style={{padding:22}}>
            {!created?<>
              <div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:500,marginBottom:6}}>Select File</div><select className="inp"><option>passport_photo.jpg</option><option>signature.jpg</option><option>aadhaar_card.pdf</option><option>SSC_CGL_READY.zip</option><option>resume_2024.pdf</option></select></div>
              <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Link Expiry</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{["1h","24h","7d","30d","Never"].map(e=><button key={e} onClick={()=>setExp(e)} className="btn" style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${exp===e?"#2563EB":"#E2E8F0"}`,background:exp===e?"#EFF6FF":"#fff",color:exp===e?"#2563EB":"#374151",fontSize:13,fontWeight:exp===e?600:400}}>{e}</button>)}</div></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,padding:"11px 14px",background:"#F8FAFC",borderRadius:10}}><div><div style={{fontSize:13,fontWeight:600}}>🔒 Password Protection</div><div style={{fontSize:11,color:"#64748B",marginTop:1}}>Require password to access</div></div><Tg on={pw} set={setPw}/></div>
              <div style={{display:"flex",gap:9}}><button onClick={()=>setShow(false)} className="btn btn-s" style={{flex:1,padding:"10px 0",fontSize:13}}>Cancel</button><button onClick={create} className="btn btn-p" style={{flex:2,padding:"10px 0",fontSize:13,fontWeight:600}}>🔗 Generate Link</button></div>
            </>:<div style={{textAlign:"center"}} className="fade">
              <div style={{fontSize:44,marginBottom:10}}>✅</div><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:7}}>Link Created!</h3>
              <div style={{background:"#F8FAFC",borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,flex:1,overflow:"hidden",textOverflow:"ellipsis",textAlign:"left",color:"#2563EB"}}>{link}</span><button onClick={()=>setCopied(true)} style={{background:"#EFF6FF",border:"none",color:"#2563EB",padding:"5px 11px",borderRadius:7,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{copied?"✅ Copied":"📋 Copy"}</button></div>
              <button onClick={()=>{setShow(false);setCreated(false);setLink("");}} className="btn btn-p" style={{width:"100%",padding:"10px 0",fontSize:13}}>Done ✓</button>
            </div>}
          </div>
        </div>
      </div>}
    </div>
  </div>);
}
function SetP(){
  const [tab,setTab]=useState("profile");const [saved,setSaved]=useState(false);const [form,setForm]=useState({name:"Arjun Sharma",email:"arjun@example.com",phone:"+91 98765 43210"});
  const [notifs,setNotifs]=useState({upload:true,process:true,share:false,storage:true,security:true,updates:false});
  const save=async()=>{await new Promise(r=>setTimeout(r,700));setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const tabs=[{id:"profile",l:"👤 Profile"},{id:"security",l:"🔒 Security"},{id:"storage",l:"💾 Storage"},{id:"notifications",l:"🔔 Notifications"},{id:"privacy",l:"🛡️ Privacy"}];
  return(<div className="fade"><TB title="Settings" sub="Manage your account and preferences"/>
    <div style={{padding:22}}>
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:18}}>
        <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",padding:8,height:"fit-content"}}>
          {tabs.map(t=><div key={t.id} className={`nav-i${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)} style={{marginBottom:2}}>{t.l}</div>)}
          <div style={{margin:"10px 6px 4px",borderTop:"1px solid #E2E8F0"}}/>
          <div className="nav-i" style={{color:"#EF4444"}}>🚪 Logout</div>
        </div>
        <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",padding:22}}>
          {tab==="profile"&&<><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:22}}>Profile Settings</h3>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,padding:"16px 20px",background:"#F8FAFC",borderRadius:11}}><div style={{width:56,height:56,background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:700}}>A</div><div><div style={{fontWeight:700,fontSize:15}}>{form.name}</div><div style={{fontSize:13,color:"#64748B"}}>Free Plan • 120 MB used</div></div><button className="btn btn-s" style={{marginLeft:"auto",padding:"6px 14px",fontSize:12}}>Change Photo</button></div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>{[["Full Name","name","text"],["Email Address","email","email"],["Phone Number","phone","tel"]].map(([l,k,t])=><div key={k}><label style={{fontSize:13,fontWeight:500,color:"#374151",display:"block",marginBottom:5}}>{l}</label><input type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="inp"/></div>)}</div>
            <button onClick={save} className="btn btn-p" style={{marginTop:20,padding:"11px 28px",fontSize:14,fontWeight:600}}>{saved?"✅ Saved!":"💾 Save Changes"}</button>
          </>}
          {tab==="security"&&<><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:22}}>Security Settings</h3>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>{["Current Password","New Password","Confirm New Password"].map((l,i)=><div key={i}><label style={{fontSize:13,fontWeight:500,color:"#374151",display:"block",marginBottom:5}}>{l}</label><input type="password" placeholder="••••••••" className="inp"/></div>)}<div style={{padding:"14px 18px",background:"#F0FDF4",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,fontSize:14}}>🔐 Two-Factor Authentication</div><div style={{fontSize:12,color:"#64748B",marginTop:1}}>Add extra security layer</div></div><button className="btn btn-p" style={{padding:"7px 18px",fontSize:13}}>Enable 2FA</button></div></div>
            <button onClick={save} className="btn btn-p" style={{marginTop:20,padding:"11px 28px",fontSize:14,fontWeight:600}}>{saved?"✅ Updated!":"🔒 Update Password"}</button>
          </>}
          {tab==="storage"&&<><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:22}}>Storage & Plan</h3>
            <div style={{padding:18,background:"#F8FAFF",borderRadius:11,marginBottom:18}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}><span style={{fontWeight:600,fontSize:14}}>Storage Used</span><span style={{fontSize:13,color:"#64748B"}}>120 MB / 1 GB</span></div><div style={{height:7,background:"#E2E8F0",borderRadius:4,overflow:"hidden"}}><div style={{width:"12%",height:"100%",background:"linear-gradient(90deg,#2563EB,#7C3AED)",borderRadius:4}}/></div><div style={{fontSize:12,color:"#64748B",marginTop:5}}>880 MB free remaining</div></div>
            <div style={{padding:20,background:"linear-gradient(135deg,#EFF6FF,#F5F3FF)",borderRadius:11,border:"1px solid #BFDBFE"}}><div className="outfit" style={{fontWeight:700,fontSize:15,marginBottom:4}}>🚀 Upgrade to Pro</div><div style={{fontSize:13,color:"#64748B",marginBottom:12}}>Unlimited storage, priority processing, API access.</div><div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>{["Unlimited Storage","Priority Processing","Bulk Operations","API Access"].map(f=><div key={f} style={{fontSize:12,color:"#2563EB"}}>✓ {f}</div>)}</div><button className="btn btn-p" style={{padding:"9px 22px",fontSize:13,fontWeight:600}}>Upgrade — ₹99/month</button></div>
          </>}
          {tab==="notifications"&&<><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:22}}>Notification Preferences</h3>
            {[{k:"upload",l:"Upload complete",d:"When files finish uploading"},{k:"process",l:"Processing done",d:"When documents are processed"},{k:"share",l:"Share link views",d:"When someone views your link"},{k:"storage",l:"Storage alerts",d:"When storage is 90% full"},{k:"security",l:"Security alerts",d:"Login from new device"},{k:"updates",l:"Product updates",d:"New features and improvements"}].map(item=>(
              <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:"1px solid #F1F5F9"}}><div><div style={{fontSize:14,fontWeight:500}}>{item.l}</div><div style={{fontSize:12,color:"#64748B"}}>{item.d}</div></div><Tg on={notifs[item.k]} set={v=>setNotifs({...notifs,[item.k]:v})}/></div>
            ))}
          </>}
          {tab==="privacy"&&<><h3 className="outfit" style={{fontSize:17,fontWeight:700,marginBottom:22}}>Privacy & Data</h3>
            <div style={{padding:"13px 18px",background:"#F0FDF4",borderRadius:11,marginBottom:18,border:"1px solid #BBF7D0"}}><div style={{fontSize:14,fontWeight:700,color:"#16A34A",marginBottom:3}}>🔒 Your data is secure</div><div style={{fontSize:13,color:"#374151",lineHeight:1.6}}>All documents AES-256 encrypted. Original files never modified. Temp files auto-deleted after 1 hour. We never share your data.</div></div>
            {[{icon:"📦",t:"Export All Data",d:"Download all your documents and data",btn:"Export",danger:false},{icon:"🗑️",t:"Delete All Documents",d:"Permanently remove all uploaded files",btn:"Delete All",danger:true},{icon:"❌",t:"Delete Account",d:"Permanently delete your account",btn:"Delete Account",danger:true}].map(item=>(
              <div key={item.t} style={{display:"flex",alignItems:"center",gap:13,padding:"13px 18px",background:"#F8FAFC",borderRadius:10,marginBottom:9}}><span style={{fontSize:22}}>{item.icon}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5}}>{item.t}</div><div style={{fontSize:12,color:"#64748B"}}>{item.d}</div></div><button style={{padding:"7px 13px",borderRadius:8,border:`1.5px solid ${item.danger?"#FCA5A5":"#E2E8F0"}`,background:item.danger?"#FEF2F2":"#fff",color:item.danger?"#DC2626":"#374151",fontSize:12.5,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{item.btn}</button></div>
            ))}
          </>}
        </div>
      </div>
    </div>
  </div>);
}
function Sidebar({page,setPage,aiOpen,setAiOpen,collapsed,setCollapsed}){
  const nav=[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"vault",icon:"🗂️",label:"My Vault"},{id:"upload",icon:"⬆️",label:"Upload"},{id:"presets",icon:"🎯",label:"Govt Presets"},{id:"ai-tools",icon:"🤖",label:"AI Tools",sub:[{id:"ai-req",label:"Req. Detector"},{id:"ai-photo",label:"Photo Enhancer"},{id:"ai-sign",label:"Signature Cleaner"}]},{id:"downloads",icon:"📥",label:"Downloads"},{id:"packages",icon:"📦",label:"Packages"},{id:"share",icon:"🔗",label:"Share Center"},{id:"settings",icon:"⚙️",label:"Settings"}];
  return(
    <div style={{width:collapsed?70:240,height:"100vh",background:"#fff",borderRight:"1px solid #E2E8F0",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,zIndex:100,transition:"width .3s ease",overflow:"hidden"}}>
      <div style={{height:62,display:"flex",alignItems:"center",gap:10,padding:collapsed?"0":"0 18px",justifyContent:collapsed?"center":"flex-start",borderBottom:"1px solid #E2E8F0",flexShrink:0}}>
        <div style={{width:32,height:32,background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏛️</div>
        {!collapsed&&<span className="outfit" style={{fontWeight:700,fontSize:16,whiteSpace:"nowrap"}}>GovDocs AI</span>}
      </div>
      <nav style={{flex:1,padding:"10px 8px",overflowY:"auto",overflowX:"hidden"}}>
        {nav.map(it=>{
          const active=page===it.id||(it.sub&&it.sub.some(s=>s.id===page));
          return(<div key={it.id}>
            <div className={`nav-i${active?" on":""}`} onClick={()=>{if(it.sub){setAiOpen(!aiOpen);if(!aiOpen)setPage(it.sub[0].id);}else setPage(it.id);}} style={{justifyContent:collapsed?"center":"flex-start",marginBottom:2}}>
              <span style={{fontSize:18,flexShrink:0}}>{it.icon}</span>
              {!collapsed&&<><span style={{flex:1}}>{it.label}</span>{it.sub&&<span style={{fontSize:10}}>{aiOpen?"▲":"▼"}</span>}</>}
            </div>
            {it.sub&&aiOpen&&!collapsed&&<div style={{paddingLeft:14,marginBottom:2}}>{it.sub.map(s=><div key={s.id} className={`nav-i${page===s.id?" on":""}`} onClick={()=>setPage(s.id)} style={{fontSize:12.5,padding:"7px 12px",marginBottom:1}}>{s.label}</div>)}</div>}
          </div>);
        })}
      </nav>
      {!collapsed&&<div style={{padding:"12px 14px",borderTop:"1px solid #E2E8F0"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>A</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Arjun Sharma</div><div style={{fontSize:11,color:"#64748B"}}>Free Plan</div></div></div></div>}
      <button onClick={()=>setCollapsed(c=>!c)} style={{padding:"10px 0",background:"none",border:"none",borderTop:"1px solid #E2E8F0",cursor:"pointer",color:"#64748B",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{collapsed?"→":"←"}</button>
    </div>
  );
}
function Landing({onAuth}){
  return(<div style={{minHeight:"100vh",background:"#fff"}}>
    <nav style={{padding:"0 5%",height:62,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #E2E8F0",position:"sticky",top:0,background:"rgba(255,255,255,.95)",backdropFilter:"blur(8px)",zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:32,height:32,background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏛️</div><span className="outfit" style={{fontWeight:700,fontSize:17}}>GovDocs AI</span></div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}><button onClick={()=>onAuth("login")} className="btn btn-s" style={{padding:"7px 18px",fontSize:14}}>Login</button><button onClick={()=>onAuth("signup")} className="btn btn-p" style={{padding:"7px 18px",fontSize:14}}>Start Free →</button></div>
    </nav>
    <div style={{textAlign:"center",padding:"72px 5% 60px",background:"linear-gradient(180deg,#EFF6FF 0%,#fff 100%)"}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:20,padding:"5px 14px",fontSize:13,color:"#2563EB",marginBottom:22,fontWeight:500}}>🤖 AI-Powered Document Platform for India</div>
      <h1 className="outfit" style={{fontSize:"clamp(1.9rem,5vw,3.2rem)",fontWeight:800,lineHeight:1.15,margin:"0 0 18px"}}>Your Documents.<br/><span style={{background:"linear-gradient(135deg,#2563EB,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Government-Ready. Always.</span></h1>
      <p style={{fontSize:"clamp(.95rem,2vw,1.15rem)",color:"#64748B",maxWidth:560,margin:"0 auto 32px",lineHeight:1.7}}>Upload once. Download in any format SSC, UPSC, Railway, Banking portals need — automatically sized, compressed, and ready.</p>
      <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}><button onClick={()=>onAuth("signup")} className="btn btn-p" style={{padding:"13px 30px",fontSize:16,fontWeight:600}}>🚀 Get Started Free</button><button onClick={()=>onAuth("demo")} className="btn btn-s" style={{padding:"13px 30px",fontSize:16}}>▶️ Live Demo</button></div>
      <div style={{display:"flex",justifyContent:"center",gap:44,marginTop:52,flexWrap:"wrap"}}>{[["50,000+","Documents Processed"],["18+","Govt Portals"],["100%","Secure & Private"]].map(([v,l])=><div key={l}><div className="outfit" style={{fontSize:27,fontWeight:800,color:"#2563EB"}}>{v}</div><div style={{fontSize:13,color:"#64748B"}}>{l}</div></div>)}</div>
    </div>
    <div style={{padding:"50px 5%"}}><h2 className="outfit" style={{fontSize:26,fontWeight:700,textAlign:"center",marginBottom:36}}>Everything You Need</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18,maxWidth:1080,margin:"0 auto"}}>
        {[{icon:"🗄️",t:"Document Vault",d:"AES-256 encrypted storage. Never lose a document again."},{icon:"⚡",t:"One-Click Conversion",d:"Auto resize, compress, convert to exact portal requirements."},{icon:"🎯",t:"18+ Govt Presets",d:"Pre-configured for SSC, UPSC, Railway, Banking, NEET, JEE."},{icon:"🤖",t:"AI Req. Detection",d:"Paste text or screenshot — AI extracts exact specifications."},{icon:"📦",t:"ZIP Package Generator",d:"Complete application bundles ready to submit in one click."},{icon:"🔗",t:"Secure Sharing",d:"Expiring, password-protected links for safe document sharing."}].map(f=>(
          <div key={f.t} className="card" style={{padding:22}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(37,99,235,.12)";e.currentTarget.style.borderColor="#93C5FD";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#E2E8F0";}}>
            <div style={{fontSize:30,marginBottom:11}}>{f.icon}</div><h3 className="outfit" style={{fontSize:15,fontWeight:700,marginBottom:7}}>{f.t}</h3><p style={{fontSize:13,color:"#64748B",lineHeight:1.6}}>{f.d}</p>
          </div>
        ))}
      </div>
    </div>
    <div style={{padding:"36px 5% 50px",background:"#F8FAFF"}}><h2 className="outfit" style={{fontSize:22,fontWeight:700,textAlign:"center",marginBottom:7}}>Supported Exam Portals</h2><p style={{textAlign:"center",color:"#64748B",marginBottom:28,fontSize:13}}>18+ presets for all major Indian government exams</p>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,maxWidth:1080,margin:"0 auto"}}>{PR.map(p=><div key={p.id} style={{background:"#fff",borderRadius:10,padding:"9px 16px",border:`2px solid ${p.color}25`,flexShrink:0,textAlign:"center",minWidth:90}}><div className="outfit" style={{fontWeight:700,fontSize:13.5,color:p.color}}>{p.name}</div><div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{p.cat}</div></div>)}</div>
    </div>
    <div style={{padding:"50px 5%",textAlign:"center",background:"linear-gradient(135deg,#1E40AF 0%,#7C3AED 100%)"}}><h2 className="outfit" style={{fontSize:26,fontWeight:800,color:"#fff",marginBottom:10}}>Start Preparing Smarter Today</h2><p style={{color:"#BFDBFE",marginBottom:30,fontSize:14}}>Join thousands of aspirants who never struggle with document formatting again.</p><button onClick={()=>onAuth("signup")} style={{background:"#fff",color:"#2563EB",border:"none",padding:"13px 34px",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🚀 Get Started Free — No Credit Card</button></div>
    <footer style={{padding:"20px 5%",borderTop:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🏛️</span><span className="outfit" style={{fontWeight:600,fontSize:15}}>GovDocs AI</span></div><div style={{fontSize:13,color:"#94A3B8"}}>© 2024 GovDocs AI. Secure & Privacy-First Platform.</div></footer>
  </div>);
}
function Auth({mode,setMode,onLogin}){
  const [loading,setLoading]=useState(false);
  const go=async()=>{setLoading(true);await new Promise(r=>setTimeout(r,1200));setLoading(false);onLogin();};
  return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#EFF6FF 0%,#F5F3FF 100%)",padding:14}}>
    <div style={{background:"#fff",borderRadius:20,padding:34,width:"100%",maxWidth:400,boxShadow:"0 8px 32px rgba(37,99,235,.15)"}} className="fade">
      <div style={{textAlign:"center",marginBottom:24}}><div style={{width:46,height:46,background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 10px"}}>🏛️</div><h2 className="outfit" style={{fontSize:21,fontWeight:700,marginBottom:3}}>GovDocs AI</h2><p style={{fontSize:13,color:"#64748B"}}>{mode==="login"?"Welcome back!":"Create your free account"}</p></div>
      <div style={{display:"flex",background:"#F1F5F9",borderRadius:10,padding:4,marginBottom:22}}>{["login","signup"].map(m=><button key={m} onClick={()=>setMode(m)} className="btn" style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:14,fontWeight:mode===m?600:400,background:mode===m?"#fff":"transparent",boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m==="login"?"Login":"Sign Up"}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {mode==="signup"&&<input placeholder="Full Name" className="inp"/>}
        <input placeholder="Email address" type="email" className="inp"/>
        <input placeholder="Password" type="password" className="inp"/>
        <button onClick={go} className="btn btn-p" style={{padding:"12px 0",fontSize:15,fontWeight:600}}>{loading?<><Sp s={15} c="#fff"/>{mode==="login"?"Logging in…":"Creating account…"}</>:(mode==="login"?"🔐 Login":"🚀 Create Account")}</button>
        <div style={{textAlign:"center",fontSize:13,color:"#64748B"}}>Or continue with</div>
        <button onClick={onLogin} className="btn btn-s" style={{padding:"10px 0",fontSize:14,fontWeight:500}}>🌐 Continue with Google</button>
      </div>
      <div style={{marginTop:18,textAlign:"center",fontSize:12,color:"#94A3B8"}}>🔒 AES-256 encrypted. We never share your documents.</div>
    </div>
  </div>);
}
export default function GovDocsAI(){
  const [screen,setScreen]=useState("landing");
  const [authMode,setAuthMode]=useState("login");
  const [page,setPage]=useState("dashboard");
  const [aiOpen,setAiOpen]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const [docs,setDocs]=useState(MD);
  const [prevFile,setPrevFile]=useState(null);
  const [dlFile,setDlFile]=useState(null);
  const sw=collapsed?70:240;
  const goAuth=m=>{if(m==="demo"){setScreen("app");return;}setAuthMode(m);setScreen("auth");};
  const rp=()=>{
    switch(page){
      case"dashboard":return <DashP docs={docs} nav={setPage}/>;
      case"vault":return <VaultP docs={docs} setDocs={setDocs} onPrev={setPrevFile} onDl={setDlFile}/>;
      case"upload":return <UpldP onUploaded={nf=>{setDocs(p=>[...nf,...p]);setPage("vault");}}/>;
      case"presets":return <PresetP/>;
      case"ai-tools":return <AIToolsHub nav={setPage}/>;
      case"ai-req":return <AIReqP/>;
      case"ai-photo":return <AIPhotoP/>;
      case"ai-sign":return <AISignP/>;
      case"downloads":return <DlP/>;
      case"packages":return <PkgP/>;
      case"share":return <ShareP/>;
      case"settings":return <SetP/>;
      default:return <DashP docs={docs} nav={setPage}/>;
    }
  };
  return(<>
    <style>{G}</style>
    {screen==="landing"&&<Landing onAuth={goAuth}/>}
    {screen==="auth"&&<Auth mode={authMode} setMode={setAuthMode} onLogin={()=>setScreen("app")}/>}
    {screen==="app"&&(
      <div style={{display:"flex",background:"#F0F4FF",minHeight:"100vh"}}>
        <Sidebar page={page} setPage={setPage} aiOpen={aiOpen} setAiOpen={setAiOpen} collapsed={collapsed} setCollapsed={setCollapsed}/>
        <div style={{marginLeft:sw,flex:1,minHeight:"100vh",transition:"margin-left .3s ease",minWidth:0}}>{rp()}</div>
        {prevFile&&<PVM file={prevFile} onClose={()=>setPrevFile(null)} onDownload={f=>{setPrevFile(null);setDlFile(f);}}/>}
        {dlFile&&<DLM file={dlFile} onClose={()=>setDlFile(null)}/>}
      </div>
    )}
  </>);
}
