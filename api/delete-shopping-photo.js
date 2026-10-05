const OWNER="mask073110",REPO="kyoto-osaka-2026-beta";
function cors(req,res){
  const o=req.headers.origin||"";
  if(["https://mask073110.github.io","https://kyoto-osaka-2026-beta.vercel.app"].includes(o))res.setHeader("Access-Control-Allow-Origin",o);
  res.setHeader("Vary","Origin");res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");
}
async function gh(path,opts={}){
  const token=process.env.GITHUB_TOKEN;if(!token)throw new Error("Vercel 尚未設定 GITHUB_TOKEN");
  return fetch("https://api.github.com/repos/"+OWNER+"/"+REPO+"/contents/"+path,{...opts,headers:{
    "Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...(opts.headers||{})
  }});
}
export default async function handler(req,res){
  cors(req,res);if(req.method==="OPTIONS")return res.status(204).end();if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    let body=typeof req.body==="string"?JSON.parse(req.body):req.body;
    const path=String(body?.path||"");
    if(!/^assets\/shopping\/[a-zA-Z0-9_-]+\.jpg$/.test(path))return res.status(200).json({ok:true,skipped:true});
    const cur=await gh(path);if(cur.status===404)return res.status(200).json({ok:true,missing:true});
    const d=await cur.json();if(!cur.ok)throw new Error(d.message||"GitHub image lookup failed");
    const rr=await gh(path,{method:"DELETE",body:JSON.stringify({message:"Delete shared shopping photo",sha:d.sha,branch:"main"})});
    const out=await rr.json();if(!rr.ok)return res.status(rr.status).json({error:out.message||"GitHub image delete failed"});
    return res.status(200).json({ok:true});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||"Delete failed"})}
}