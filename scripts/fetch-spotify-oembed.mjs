import { writeFile, mkdir } from "node:fs/promises";

const TRACK_IDS = [
    '1kYQKiIcKlb50gdGV0bQgI',
    '0ow5vB5lXD4qgyIxfPpyQM',
    '3iagBbwPvqBZ2kFQnemEE6',
    '3bpPHTbLo2wiF2x4J4y0Cj',
    '32IWTxGjwmhxCUWKBgecsQ',
    '1juV1TCsmEqNL03TVk8k5x',
    '2haqjiB5dQSfwovW5oiUn0',
    '4FaWPZS9dsm8k8sPkd44W1',
    '0QCwknZiYdZRHkjac10BOI',
    '0MYRK3ocJnenzLJBp1GxmD',
    '6mQKP6IMP9Qg2g3Ju0bbc2',
    '3E7EsJm3RxeRrnSMiupBrC',
    '3g7yrEUqTBxUVWvsBXFMVq',
    '60oohRtbXDZbyEmpO6oEAt',
    '5UNFbQZaxC88MuxfZOTp6V',
    '64eiQPbADxKi4H8N0bgwpK',
    '1KfxbuUy9cWsPRjuuljShz',
    '3BhOzMmYRcTHbzmH7X59lH',
    '0KhegH7Z23Dez5NglRrQbr',
    '2fVtuaYfVXX64mkuAHGBUE',
    '4DCOZFMGjRxtiAwLhyTI6r',
    '2Whketr8HKdZx8LVTaj05M',
    '6omGpXXBK0tM03XOhn5ERV',
    '5lCtCHQSn1GT8Bl5sqL7qo',
    '72sRAIUPIKOJ6xJIMzdmdw',
    '3xRDwgMuIpHhwYhFgmXYYI',
    '6bWN5GvozwypfQqcaLMgmW',
    '70Xh6rPSOqaknC4JZAGO6d',
    '1LnhOtkfLIJCDZN2tvzHpK',
    '7ieJTv5nDCDMLYdeBesVzF',
    '70X0O8es8b43ZsZd2CAJti',
    '5HEI2rmQyjvREYu30rMiWm',
    '42rm5mIAvkZbl01IOtazQY',
    '0QcVotYSMxZqCHhHRcaUqs',
    '03B9qkMF0i6rollZHWSvPw',
];

await mkdir("data", { recursive: true });

for (const id of TRACK_IDS) {
  const url = `https://open.spotify.com/track/${id}`;
  const res = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  );
  if (!res.ok) throw new Error(`${id}: ${res.status}`);
  await writeFile(`data/${id}.json`, JSON.stringify(await res.json(), null, 2));
  console.log(`saved ${id}`);
}