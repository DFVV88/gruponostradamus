/* Grupo Nostradamus - Integración visual estable de Cuentas por pagar */

function placePayablesAsFinanceModule(){
  const finance = document.getElementById('nostra-finance-panel');
  const section = document.getElementById('finance-payables-section');
  if(!finance || !section) return false;
  if(section.parentElement === finance) return true;

  const containingAccordion = section.closest('.finance-general-accordion');
  if(containingAccordion && containingAccordion.parentElement === finance){
    containingAccordion.insertAdjacentElement('afterend',section);
    return true;
  }

  const receivablesAccordion = document.getElementById('finance-accordion-receivables');
  if(receivablesAccordion && receivablesAccordion.parentElement === finance){
    receivablesAccordion.insertAdjacentElement('afterend',section);
  }else{
    const closeAccordion = document.getElementById('finance-accordion-close');
    if(closeAccordion && closeAccordion.parentElement === finance) closeAccordion.insertAdjacentElement('beforebegin',section);
    else finance.appendChild(section);
  }
  return true;
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(placePayablesAsFinanceModule() || attempts > 100) window.clearInterval(timer);
  },120);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
