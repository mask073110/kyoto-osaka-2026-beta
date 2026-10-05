export const config={api:{bodyParser:{sizeLimit:"5mb"}}};

export default async function handler(req,res){
  const origin=req.headers.origin||"";
  const allowed=["https://mask073110.github.io","https://kyoto-osaka-2026-beta.vercel.app"];
  if(allowed.includes(origin))res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    let body=req.body;
    if(typeof body==="string")body=JSON.parse(body);
    const dataUrl=typeof body?.image==="string"?body.image:"";
    const id=String(body?.id||Date.now()).replace(/[^a-zA-Z0-9_-]/g,"").slice(0,80);
    if(!/^data:image\/jpeg;base64,/i.test(dataUrl)||dataUrl.length>4_500_000)return res.status(400).json({error:"Unsupported or oversized image"});
    const cloud="zekmv6bu",preset="kyoto_osaka_shopping";
    const fd=new FormData();
    const bytes=Buffer.from(dataUrl.split(",")[1],"base64");
    fd.append("file",new Blob([bytes],{type:"image/jpeg"}),id+".jpg");
    fd.append("upload_preset",preset);
    const rr=await fetch("https://api.cloudinary.com/v1_1/"+cloud+"/image/upload",{method:"POST",body:fd});
    const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}
    if(!rr.ok||!data.secure_url)return res.status(rr.status||502).json({error:data?.error?.message||raw||"Cloudinary upload failed"});
    return res.status(200).json({url:data.secure_url,publicId:data.public_id||""});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||"Upload failed"})}
}
