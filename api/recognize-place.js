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
    const apiKey=process.env.GEMINI_API_KEY;
    if(!apiKey)return res.status(500).json({error:"Gemini API key unavailable"});
    const prompt=`Identify the MAIN real-world place, shop, restaurant, attraction or facility shown in these screenshots for a Kyoto/Osaka travel itinerary. User-selected category: ${body?.category||"景點"}. Ignore phone status bars, browser chrome, Google navigation tabs, generic article/UI text and unrelated recommendations. Return ONLY a valid JSON object, no markdown, with keys: name, localName, category, city, address, rating, hours, confidence, searchQuery. Use Traditional Chinese for category/city where natural. confidence is integer 0-100. Do not invent address, rating or hours: use null when not visible/reliably inferable. name should be the commonly recognizable place name. searchQuery should combine the identified place with city. If uncertain, still give the best place-name candidate but lower confidence.`;
    const parts=[{text:prompt}];
    for(const dataUrl of images){
      const m=dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);
      parts.push({inline_data:{mime_type:m[1].toLowerCase(),data:m[2]}});
    }
    const models=["gemini-3.8-flash","gemini-3.6-flash","gemini-3.5-flash"];
    let rr,data,lastDetail="";
    for(const model of models){
      const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      rr=await fetch(endpoint,{method:"POST",headers:{"x-goog-api-key":apiKey,"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{temperature:0.1,maxOutputTokens:700,responseMimeType:"application/json",thinkingConfig:{thinkingLevel:"low"}}})});
      data=await rr.json();
      if(rr.ok)break;
      lastDetail=data?.error?.message||String(rr.status);
      const retryable=rr.status===429||rr.status===503||/high demand|overloaded|temporar/i.test(lastDetail);
      if(!retryable)break;
    }
    if(!rr?.ok)return res.status(502).json({error:"Gemini Vision service failed",detail:lastDetail||rr?.status||"Unknown Gemini error"});
    let text=(data?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").trim();
    text=text.replace(/^\`\`\`(?:json)?\s*/i,"").replace(/\s*\`\`\`$/,"");
    const result=JSON.parse(text);
    result.category=result.category||body?.category||"景點";
    result.confidence=Math.max(0,Math.min(100,Number(result.confidence)||0));
    return res.status(200).json(result);
  }catch(e){console.error(e);return res.status(500).json({error:"Recognition failed",detail:String(e?.message||e)})}
}
