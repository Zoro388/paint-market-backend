import dns from "dns";

console.log("DNS Servers:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.paintmarket.1w4dyzq.mongodb.net",
  (err, records) => {
    console.log("ERR:", err);
    console.log("RECORDS:", records);
  }
);