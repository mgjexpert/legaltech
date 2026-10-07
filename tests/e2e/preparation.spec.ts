import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("synthetic preparation: intake, fact confirmation, readiness and Case Pack",async({page})=>{
  await page.goto("/");
  await expect(page.getByText("Ambiente de testes",{exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Visão geral",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Preparação inicial",exact:true}).click();
  await page.getByLabel("Há filhos?").selectOption("no");
  await page.getByLabel("Renda mensal fictícia (R$)").fill("7000,50");
  await page.getByRole("button",{name:"Atualizar exemplo"}).click();
  await expect(page.getByRole("status")).toContainText("Exemplo atualizado");
  await page.getByRole("button",{name:"Organização financeira",exact:true}).click();
  await expect(page.getByText("R$ 7.000,50",{exact:true})).toBeVisible();
  await expect(page.getByText("Divergência a verificar",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Confirmar fato fictício"}).click();
  await expect(page.getByText("Fato fictício confirmado",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Relatório de preparação",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Estado de preparação do caso"})).toBeVisible();
  await expect(page.getByText("Documentos dos filhos",{exact:false})).toHaveCount(0);
  const event=page.waitForEvent("download");
  await page.getByRole("button",{name:"Exportar Case Pack sintético (JSON)"}).click();
  const download=await event;
  expect(download.suggestedFilename()).toBe("case-pack-sintetico.json");
  const file=await download.path();
  expect(file).toBeTruthy();
  const pack=JSON.parse(await readFile(file!,"utf8"));
  expect(pack.synthetic).toBe(true);
  expect(pack.intake.monthlyIncomeCents).toBe(700050);
  expect(pack.readiness.documents.missing).toEqual(["RELATIONSHIP"]);
  expect(pack.readiness.legalReadiness).toBe("NOT_ASSESSED");
  expect(pack.readiness.discrepancies).toHaveLength(1);
  expect(pack.facts[0].confirmedBy).toBe("00000000-0000-4000-8000-000000000001");
  await page.reload();
  await expect(page.getByRole("heading",{name:"Visão geral",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Organização financeira",exact:true}).click();
  await expect(page.getByText("R$ 6.500,00",{exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Confirmar fato fictício"})).toBeVisible();
});

test("mobile workspace remains usable and clearly synthetic",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  await expect(page.getByText("Ambiente de testes",{exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Visão geral",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Revisar preparação"}).click();
  await expect(page.getByLabel("Renda mensal fictícia (R$)")).toBeVisible();
  await page.screenshot({path:"artifacts/mobile.png",fullPage:true});
});

test("health response and headers reflect demo scope",async({request,page})=>{
  const health=await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({environment:"synthetic-demo",persistence:false});
  const response=await page.goto("/");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  await page.screenshot({path:"artifacts/dashboard.png",fullPage:true});
});
