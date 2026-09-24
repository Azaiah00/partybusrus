/* Development-only accessibility report. Served by the preview server, never deployed. */
window.addEventListener('load',function(){
  if(!window.axe){var missing=document.createElement('p');missing.id='qa-accessibility-report';missing.textContent='Accessibility check did not run. Install the optional development dependency with npm ci and reload.';document.body.appendChild(missing);return;}
  window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}).then(function(result){
    var panel=document.createElement('details');panel.id='qa-accessibility-report';
    var title=document.createElement('summary');title.textContent='Local QA: '+result.violations.length+' accessibility rule failures';panel.appendChild(title);
    var pre=document.createElement('pre');pre.textContent=JSON.stringify({violations:result.violations.map(function(v){return{id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(function(n){return{target:n.target,summary:n.failureSummary,html:n.html}})}}),incomplete:result.incomplete.map(function(v){return{id:v.id,nodes:v.nodes.length}}),passes:result.passes.length},null,2);panel.appendChild(pre);panel.style.cssText='margin:30px;padding:24px;background:white;color:black;overflow:auto;position:relative;z-index:1';document.body.appendChild(panel);
  }).catch(function(error){var pre=document.createElement('pre');pre.id='qa-accessibility-report';pre.textContent=error.message;document.body.appendChild(pre)});
});
