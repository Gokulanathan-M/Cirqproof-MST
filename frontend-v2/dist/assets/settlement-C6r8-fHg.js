import{a as s}from"./index-Bo5BoNk-.js";const o={deposit:e=>s.post("/settlement/deposit",e).then(t=>t.data),release:e=>s.post("/settlement/release",e).then(t=>t.data)};export{o as settlementApi};
