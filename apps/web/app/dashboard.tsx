"use client";
import { useState } from "react";
import { calculateReadiness, IntakeSchema, sumCents, type Intake, type Fact } from "@fro/domain";
import { demoIntake, demoDocuments, demoFact, DEMO_CASE_ID, DEMO_WORKSPACE_ID, DEMO_USER_ID } from "./demo";

const tabs = [
  ["overview", "Visão geral"], ["intake", "Preparação inicial"], ["documents", "Documentos"],
  ["finances", "Organização financeira"], ["report", "Relatório de preparação"],
] as const;
type Tab = typeof tabs[number][0];
const documentNames: Record<string,string> = {
  IDENTITY: "Identificação", INCOME: "Comprovante de renda", RELATIONSHIP: "Certidão / vínculo", CHILDREN: "Documentos dos filhos",
};
const money = (value: number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value/100);
export default function Dashboard() {
  const [tab,setTab] = useState<Tab>("overview");
  const [intake,setIntake] = useState<Intake>(demoIntake);
  const [facts,setFacts] = useState<Fact[]>([demoFact]);
  const [notice,setNotice] = useState("");
  const readiness = calculateReadiness(intake,demoDocuments,facts,{caseId:DEMO_CASE_ID,workspaceId:DEMO_WORKSPACE_ID});
  const expenses = [{name:"Educação · exemplo",value:80000},{name:"Saúde · exemplo",value:25000},{name:"Transporte · exemplo",value:18000}];
  const total = sumCents(expenses.map(item=>item.value));
  function saveIntake(form: FormData) {
    const rawIncome = String(form.get("income") ?? "");
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(rawIncome)) { setNotice("Use um valor não negativo com até duas casas decimais."); return; }
    const [whole="0",fraction=""] = rawIncome.replace(",",".").split(".");
    const parsed = IntakeSchema.safeParse({
      relationship: form.get("relationship"), state: form.get("state"),
      hasChildren: form.get("children") === "yes", objective: form.get("objective"),
      monthlyIncomeCents: Number(whole)*100+Number(fraction.padEnd(2,"0")),
    });
    if (!parsed.success) { setNotice("Revise os campos do exemplo antes de continuar."); return; }
    setIntake(parsed.data); setNotice("Exemplo atualizado nesta sessão. Ao recarregar, os dados fictícios são restaurados.");
  }
  function exportPack() {
    const pack = {
      formatVersion: 1, synthetic: true, generatedAt: new Date().toISOString(), caseId: DEMO_CASE_ID,
      mode: "SELF_SERVICE_INFORMATIONAL", intake, readiness, documents: demoDocuments, facts,
      limitations: ["Somente dados sintéticos", "Sem validade jurídica", "Sem revisão profissional", "Sem arquivos documentais reais", "Sem auditoria persistida"],
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack,null,2)],{type:"application/json"}));
    const a = document.createElement("a"); a.href=url; a.download="case-pack-sintetico.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setNotice("Case Pack sintético exportado. A versão profissional será implementada com consentimento e escopos.");
  }
  return <div className="shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Family Resolution OS, início"><span className="brand-icon">F</span><span>Family Resolution<span className="brand-sub">WORKSPACE</span></span></a>
      <div className="workspace-label">ESPAÇO INDIVIDUAL</div>
      <nav aria-label="Navegação do caso">{tabs.map(([key,label])=><button key={key} aria-current={tab===key?"page":undefined} onClick={()=>{setTab(key);setNotice("");}}><span className="nav-dot" />{label}</button>)}</nav>
      <div className="future"><p>Próximas fases</p><span>Portal profissional</span><span>Comunicação e negociação</span></div>
      <div className="privacy-card"><span aria-hidden="true">◈</span><strong>Seu espaço, seu controle</strong><p>Compartilhamentos exigirão sua autorização explícita.</p></div>
      <div className="user"><div className="avatar">A</div><div>Parte A fictícia<small>Workspace de demonstração</small></div></div>
    </aside>
    <main>
      <div className="demo-banner"><strong>Ambiente de testes</strong><span>Dados fictícios · use apenas exemplos sintéticos · sem login ou persistência</span></div>
      <header className="topbar"><span>Seu espaço <span className="breadcrumb">/ Caso demonstrativo</span></span><span className="pill">Modo informativo</span></header>
      <div className="content">
        <div className="heading"><div><p className="eyebrow">UM PASSO DE CADA VEZ</p><h1>{tabs.find(([key])=>key===tab)?.[1]}</h1><p>Organize as informações do seu caso com clareza e controle.</p></div><span className="status"><span />Em preparação</span></div>
        <p role="status" className={notice?"notice":"notice-empty"}>{notice}</p>
        {tab==="overview" && <>
          <section className="welcome"><div><span className="label">SEU CASO</span><h2>Comece pelo que você já sabe.</h2><p>Reúna informações, confirme os fatos e identifique o que falta antes da conversa com um profissional.</p><button className="primary" onClick={()=>setTab("intake")}>Revisar preparação <span aria-hidden="true">→</span></button></div><div className="welcome-mark" aria-hidden="true">◌</div></section>
          <div className="metrics">
            <article><span>Preparação inicial</span><strong>{readiness.intake.percent}<small>%</small></strong><div className="progress"><span style={{width:readiness.intake.percent+"%"}} /></div><p>{readiness.intake.answered} de {readiness.intake.total} temas preenchidos</p></article>
            <article><span>Documentos confirmados</span><strong>{readiness.documents.confirmedRequired}<small> / {readiness.documents.required.length}</small></strong><p>{readiness.documents.missing.length} categorias ainda pendentes</p></article>
            <article><span>Fatos confirmados</span><strong>{readiness.facts.confirmed}<small> / {facts.length}</small></strong><p>{readiness.facts.pending} aguardando sua confirmação</p></article>
          </div>
          <div className="columns"><section className="panel"><div className="panel-heading"><h2>Seus próximos passos</h2><span className="label">PREPARAÇÃO</span></div>
            <button className="task" onClick={()=>setTab("documents")}><span className="task-number">01</span><span><strong>Revisar os documentos pendentes</strong><small>Confirme a certidão e organize documentos dos filhos.</small></span><span aria-hidden="true">→</span></button>
            <button className="task" onClick={()=>setTab("finances")}><span className="task-number">02</span><span><strong>Conferir sua organização financeira</strong><small>Renda, despesas e origem das informações.</small></span><span aria-hidden="true">→</span></button>
            <button className="task" onClick={()=>setTab("report")}><span className="task-number">03</span><span><strong>Ver o relatório de preparação</strong><small>Pendências e material para revisão humana.</small></span><span aria-hidden="true">→</span></button>
          </section><section className="panel privacy"><span className="label">PRIVACIDADE DO CASO</span><h2>Um espaço privado.</h2><p>Nenhuma contraparte está conectada. Nenhum profissional possui acesso neste exemplo.</p><dl><div><dt>Documentos no exemplo</dt><dd>3</dd></div><div><dt>Itens compartilhados</dt><dd>0</dd></div><div><dt>Acessos profissionais</dt><dd>0</dd></div></dl><p className="muted">Isolamento real e concessões serão conectados ao backend na próxima etapa.</p></section></div>
        </>}
        {tab==="intake" && <section className="panel"><h2>Informações para organização</h2><p>Edite apenas dados fictícios. Este formulário demonstra o intake; não cria um caso real.</p>
          <form action={saveIntake} className="form-grid">
            <label>Tipo de vínculo<select name="relationship" defaultValue={intake.relationship}><option value="MARRIAGE">Casamento</option><option value="STABLE_UNION">União estável</option><option value="OTHER">Outro / a esclarecer</option></select></label>
            <label>Estado<select name="state" defaultValue={intake.state}>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(state=><option key={state}>{state}</option>)}</select></label>
            <label>Há filhos?<select name="children" defaultValue={intake.hasChildren?"yes":"no"}><option value="yes">Sim</option><option value="no">Não</option></select></label>
            <label>Objetivo<select name="objective" defaultValue={intake.objective}><option value="PREPARE">Preparar informações</option><option value="ORGANIZE_SUPPORT">Organizar despesas e alimentos</option><option value="PROFESSIONAL_REVIEW">Levar ao meu profissional</option></select></label>
            <label>Renda mensal fictícia (R$)<input name="income" inputMode="decimal" defaultValue={((intake.monthlyIncomeCents??0)/100).toFixed(2)} required /></label>
            <div className="form-submit"><button className="primary" type="submit">Atualizar exemplo</button></div>
          </form></section>}
        {tab==="documents" && <section className="panel"><h2>Document Room</h2><p>Índice sintético de documentos. Upload, análise e armazenamento ainda não estão conectados.</p>
          <div className="table-wrap"><table><thead><tr><th>Documento</th><th>Versão</th><th>Estado</th><th>Escopo</th></tr></thead><tbody>{demoDocuments.map(doc=><tr key={doc.id}><td>{doc.label}</td><td>v{doc.version}</td><td><span className="pill">{doc.status==="CONFIRMED"?"Confirmado":"Revisão pendente"}</span></td><td>Privado A</td></tr>)}</tbody></table></div>
          <div className="callout"><strong>Categorias pendentes</strong><p>{readiness.documents.missing.map(category=>documentNames[category]).join(" · ")||"Nenhuma categoria pendente no exemplo."}</p></div>
        </section>}
        {tab==="finances" && <><section className="panel"><h2>Organização financeira</h2><p>Valores de exemplo para organizar informações. Não representam cálculo de pensão ou conclusão jurídica.</p>
          <div className="metrics compact"><article><span>Renda mensal declarada</span><strong className="money">{money(intake.monthlyIncomeCents??0)}</strong></article><article><span>Despesas demonstrativas</span><strong className="money">{money(total)}</strong></article></div>
          <table><thead><tr><th>Categoria</th><th>Valor mensal</th></tr></thead><tbody>{expenses.map(item=><tr key={item.name}><td>{item.name}</td><td>{money(item.value)}</td></tr>)}</tbody></table></section>
          {readiness.discrepancies.length>0 && <div className="callout"><strong>Divergência a verificar</strong><p>A renda declarada difere da evidência do exemplo. Nenhum valor foi substituído automaticamente.</p></div>}
          <section className="panel fact-panel"><span className="label">FATO E EVIDÊNCIA</span><h2>Renda extraída: {money(Number(facts[0]?.value??0))}</h2><p>Origem: comprovante fictício de renda · versão 1 · página 1. A extração não se torna fato confirmado automaticamente.</p>
            {facts[0]?.status==="CANDIDATE"?<button className="primary" onClick={()=>{setFacts([{...demoFact,status:"CONFIRMED",confirmedBy:DEMO_USER_ID,confirmedAt:new Date().toISOString()}]);setNotice("Fato sintético confirmado nesta sessão. Não há gravação em banco.");}}>Confirmar fato fictício</button>:<span className="pill">Fato fictício confirmado</span>}
          </section></>}
        {tab==="report" && <section className="panel"><span className="label">READINESS REPORT · DEMONSTRAÇÃO</span><h2>Estado de preparação do caso</h2><p>Este relatório identifica informações e pendências. A adequação jurídica da rota não foi avaliada.</p>
          <dl className="report-list"><div><dt>Intake</dt><dd>{readiness.intake.answered}/{readiness.intake.total} temas</dd></div><div><dt>Documentos pendentes</dt><dd>{readiness.documents.missing.map(c=>documentNames[c]).join(", ")||"Nenhum no exemplo"}</dd></div><div><dt>Fatos a confirmar</dt><dd>{readiness.facts.pending}</dd></div><div><dt>Fatos em disputa</dt><dd>{readiness.facts.disputed}</dd></div><div><dt>Revisão profissional</dt><dd>Não realizada</dd></div></dl>
          <div className="callout"><strong>Próximo passo</strong><p>Revise informações e documentos antes de conversar com seu advogado, Defensoria ou profissional autorizado.</p></div>
          {readiness.discrepancies.length>0 && <div className="callout"><strong>Divergência a verificar</strong><p>A renda declarada difere da evidência do exemplo. Compare as fontes antes de consolidar o fato.</p></div>}
          <button className="primary" onClick={exportPack}>Exportar Case Pack sintético (JSON)</button>
        </section>}
        <footer>Family Resolution OS · Base de engenharia v0.1 <span>Informação e organização. Decisões jurídicas exigem profissional autorizado.</span></footer>
      </div>
    </main>
  </div>;
}
