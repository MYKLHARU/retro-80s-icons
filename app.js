"use strict";
(() => {
  const all = window.RETRO_ICONS || [];
  const pack = window.RETRO_PACK;
  const perPage = 20;
  const number = new Intl.NumberFormat("en-GB");
  const collator = new Intl.Collator("en-GB", {numeric:true,sensitivity:"base"});
  const $ = id => document.getElementById(id);
  const ui = {search:$("search"),category:$("category"),sort:$("sort"),grid:$("icon-grid"),count:$("result-count"),clear:$("clear-filters"),empty:$("empty-state"),prev:$("previous-page"),next:$("next-page"),page:$("page-status"),dialog:$("icon-dialog"),close:$("dialog-close")};
  let page = 1, filtered = [], current = 0, opener = null;
  const normalise = s => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const imageUrl = icon => "icons/" + encodeURIComponent(icon.file) + (icon.file==="appsgeneric.png" ? "?v="+encodeURIComponent(pack.version) : "");
  if (!pack || !all.length) {ui.count.textContent="The collection couldn’t load. Please refresh the page.";return;}
  for (const category of pack.categories) {
    const option = document.createElement("option");option.value=category.name;option.textContent=category.name+" ("+number.format(category.count)+")";ui.category.append(option);
  }
  function applyFilters() {
    const query=normalise(ui.search.value.trim());
    filtered=all.filter(i => (!ui.category.value || i.category===ui.category.value) && (!query || normalise(i.label+" "+i.file+" "+i.category).includes(query)));
    filtered.sort((a,b)=>collator.compare(a.label,b.label)||collator.compare(a.file,b.file));
    if(ui.sort.value==="desc")filtered.reverse();
    page=1;render();
  }
  function render() {
    const pages=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.min(Math.max(page,1),pages);
    const start=(page-1)*perPage,end=Math.min(start+perPage,filtered.length),fragment=document.createDocumentFragment();
    filtered.slice(start,end).forEach((icon,local)=>{
      const card=$("card-template").content.cloneNode(true),preview=card.querySelector(".icon-preview"),img=card.querySelector("img"),download=card.querySelector(".icon-download"),title=card.querySelector("h3");
      img.src=imageUrl(icon);img.alt=icon.label+" retro icon";
      title.textContent=icon.label;title.title=icon.label;card.querySelector(".card-info p").textContent=icon.category;
      preview.setAttribute("aria-label","Preview "+icon.label);preview.addEventListener("click",()=>openIcon(start+local,preview));
      download.href=imageUrl(icon);download.download=icon.file;download.setAttribute("aria-label","Download "+icon.label+" PNG");
      fragment.append(card);
    });
    ui.grid.replaceChildren(fragment);ui.empty.hidden=filtered.length!==0;
    ui.clear.hidden=!ui.search.value&&!ui.category.value&&ui.sort.value==="asc";
    ui.count.textContent=filtered.length ? number.format(start+1)+"–"+number.format(end)+" of "+number.format(filtered.length)+" designs" : "0 designs found";
    ui.page.textContent="Page "+page+" of "+pages;
    ui.prev.disabled=page===1||!filtered.length;ui.next.disabled=page===pages||!filtered.length;
  }
  function reset() {ui.search.value="";ui.category.value="";ui.sort.value="asc";applyFilters();}
  function changePage(direction) {page+=direction;render();ui.grid.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
  function updateDialog() {
    const icon=filtered[current];if(!icon)return;
    $("dialog-title").textContent=icon.label;$("dialog-category").textContent=icon.category;
    $("dialog-image").src=imageUrl(icon);$("dialog-image").alt=icon.label+" retro icon";
    $("dialog-download").href=imageUrl(icon);$("dialog-download").download=icon.file;
    $("dialog-position").textContent=number.format(current+1)+" / "+number.format(filtered.length);
    $("dialog-previous").disabled=current===0;$("dialog-next").disabled=current===filtered.length-1;
  }
  function openIcon(position,button) {current=position;opener=button;updateDialog();ui.dialog.showModal();document.body.style.overflow="hidden";ui.close.focus();}
  function moveIcon(direction) {const target=current+direction;if(target<0||target>=filtered.length)return;current=target;updateDialog();}
  ui.search.addEventListener("input",applyFilters);ui.category.addEventListener("change",applyFilters);ui.sort.addEventListener("change",applyFilters);
  ui.clear.addEventListener("click",reset);$("empty-reset").addEventListener("click",()=>{reset();ui.search.focus();});
  ui.prev.addEventListener("click",()=>changePage(-1));ui.next.addEventListener("click",()=>changePage(1));
  ui.close.addEventListener("click",()=>ui.dialog.close());
  ui.dialog.addEventListener("close",()=>{document.body.style.overflow="";if(opener?.isConnected)opener.focus({preventScroll:true});});
  ui.dialog.addEventListener("click",event=>{const r=ui.dialog.getBoundingClientRect();if(event.target===ui.dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))ui.dialog.close();});
  $("dialog-previous").addEventListener("click",()=>moveIcon(-1));$("dialog-next").addEventListener("click",()=>moveIcon(1));
  document.addEventListener("keydown",event=>{
    if(ui.dialog.open){if(event.key==="ArrowRight"){event.preventDefault();moveIcon(1);}if(event.key==="ArrowLeft"){event.preventDefault();moveIcon(-1);}return;}
    const input=/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable;
    if(event.key==="/"&&!input&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();ui.search.focus();}
  });
  applyFilters();
})();
