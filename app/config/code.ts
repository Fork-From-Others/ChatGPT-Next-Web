import md5 from "spark-md5";

export async function getOnlineCodes() {
  const today = new Date();
  const url =
    process.env.CODE_URL ??
    "https://aipark.oss-cn-hangzhou.aliyuncs.com/chatglm/code.csv?t=" +
      today.getTime();
  const fetchOptions = {
    headers: {
      "Cache-Control": "no-store",
    },
    method: "GET",
  };
  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    const lines = text.split("\n").map((v) => v.trim());

    let codes = new Set();
    let codes_hash = new Set();

    lines.slice(1).forEach((line) => {
      const [code, expireAt] = line
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      const expireDate = new Date(expireAt);
      if (expireDate > today) {
        codes.add(code.trim());
        codes_hash.add(md5.hash(code.trim()));
      }
    });
    console.log(`[Server Config] using ${codes.size} online codes`);
    return [codes, codes_hash];
  } catch (e) {
    console.error("Failed to fetch or parse remote config:", e);
    return [new Set(), new Set()];
  }
}

const [online_codes, online_codes_hash] = await getOnlineCodes();

export const online_codes_set = online_codes;
export const online_codes_hash_set = online_codes_hash;
export const runtime = "edge";
