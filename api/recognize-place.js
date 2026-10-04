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
    const images=Array.isArray(body?.images)?body.images.slice(0,3):[];
    if(!images.length)return res.status(400).json({error:"No image supplied"});
    if(images.some(x=>typeof x!=="string"||!/^data:image\/(jpeg|png|webp);base64,/i.test(x)||x.length>5_500_000))return res.status(400).json({error:"Unsupported or oversized image"});
    const oidcHeader=Array.isArray(req.headers["x-vercel-oidc-token"])?req.headers["x-vercel-oidc-token"][0]:req.headers["x-vercel-oidc-token"];
    const token=process.env.AI_GATEWAY_API_KEY||oidcHeader||process.env.VERCEL_OIDC_TOKEN;
    if(!token)return res.status(500).json({error:"AI Gateway authentication unavailable"});
    const content=[{type:"input_text",text:`Identify the MAIN real-world place, shop, restaurant, attraction or facility shown in these screenshots for a Kyoto/Osaka travel itinerary. User-selected category: ${body?.category||"景點"}. Ignore phone status bars, browser chrome, Google navigation tabs, generic article/UI text and unrelated recommendations. Return ONLY a valid JSON object, no markdown, with keys: name, localName, category, city, address, rating, hours, confidence, searchQuery. Use Traditional Chinese for category/city where natural. confidence is integer 0-100. Do not invent address, rating or hours: use null when not visible/reliably inferable. name should be the commonly recognizable place name. searchQuery should combine the identified place with city. If uncertain, still give the best place-name candidate but lower confidence.`}];
    for(const image_url of images)content.push({type:"input_image",image_url,detail:"high"});
    const rr=await fetch("https://ai-gateway.vercel.sh/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({model:"google/gemini-3.1-pro-preview",input:[{role:"user",content}],max_output_tokens:700})});
    const data=await rr.json();
    if(!rr.ok)return res.status(502).json({error:"Vision service failed",detail:data?.error?.message||rr.status});
    let text=data.output_text||"";
    if(!text&&Array.isArray(data.output))for(const o of data.output)for(const c of (o.content||[]))if(c.type==="output_text")text+=c.text||"";
    text=text.trim().replace(/^\`\`\`(?:json)?\s*/i,"").replace(/\s*\`\`\`$/,"");
    const result=JSON.parse(text);
    result.category=result.category||body?.category||"景點";
    result.confidence=Math.max(0,Math.min(100,Number(result.confidence)||0));
    return res.status(200).json(result);
  }catch(e){console.error(e);return res.status(500).json({error:"Recognition failed",detail:String(e?.message||e)})}
}
