export const config={api:{bodyParser:{sizeLimit:"5mb"}}};

const OWNER="mask073110",REPO="kyoto-osaka-2026-beta";
function cors(req,res){
  const o=req.headers.origin||"";
  if(["https://mask073110.github.io","https://kyoto-osaka-2026-beta.vercel.app"].includes(o))res.setHeader("Access-Control-Allow-Origin",o);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
}
async function gh(path,opts={}){
  const token=process.env.GITHUB_TOKEN;
  if(!token)throw new Error("Vercel 尚未設定 GITHUB_TOKEN");
  return fetch("https://api.github.com/repos/"+OWNER+"/"+REPO+"/contents/"+path,{...opts,headers:{
    "Accept":"application/vnd.github+json","Authorization":"Bearer "+token,
    "X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...(opts.headers||{})
  }});
}
export default async function handler(req,res){
  cors(req,res);
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    let body=typeof req.body==="string"?JSON.parse(req.body):req.body;
    const dataUrl=typeof body?.image==="string"?body.image:"";
    const id=String(body?.id||Date.now()).replace(/[^a-zA-Z0-9_-]/g,"").slice(0,80);
    if(!/^data:image\/jpeg;base64,/i.test(dataUrl)||dataUrl.length>4_500_000)return res.status(400).json({error:"Unsupported or oversized image"});
    const content=dataUrl.split(",")[1],path="assets/shopping/"+id+".jpg";
    const payload={message:"Add shared shopping photo "+id,content,branch:"main"};
    const rr=await gh(path,{method:"PUT",body:JSON.stringify(payload)});
    const d=await rr.json();
    if(!rr.ok)return res.status(rr.status).json({error:d.message||"GitHub image upload failed"});
    const url="https://raw.githubusercontent.com/"+OWNER+"/"+REPO+"/main/"+path+"?v="+Date.now();
    return res.status(200).json({url,publicId:path});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||"Upload failed"})}
}