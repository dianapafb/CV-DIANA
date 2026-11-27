const $ = s => document.querySelector(s);
const crear = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; };
const iniciales = CV.nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();

/* ---------- Encabezado ---------- */
document.title = "CV | " + CV.nombre;
$("#nombre").textContent = CV.nombre;
$("#logo").textContent = iniciales;
$("#pie").textContent = CV.nombre;
$("#anio").textContent = new Date().getFullYear();
$("#resumen").textContent = CV.resumen;

const foto = $("#foto");
const img = crear("img");
img.src = CV.foto; img.alt = "Foto de " + CV.nombre;
img.onerror = () => { foto.innerHTML = ""; foto.textContent = iniciales; };
foto.appendChild(img);

/* ---------- Efecto de escritura ---------- */
let r = 0, c = 0, borrando = false;
(function escribir() {
  const rol = CV.roles[r] || "";
  c += borrando ? -1 : 1;
  $("#rol").textContent = rol.slice(0, c);
  let t = borrando ? 40 : 90;
  if (!borrando && c === rol.length) { borrando = true; t = 1400; }
  else if (borrando && c === 0) { borrando = false; r = (r + 1) % CV.roles.length; t = 400; }
  setTimeout(escribir, t);
})();

/* ---------- Utilidades ---------- */
function ocultar(idSeccion) {
  const s = document.getElementById(idSeccion); if (s) s.style.display = "none";
  const a = document.querySelector(`#menu a[href="#${idSeccion}"]`); if (a) a.style.display = "none";
}
function linea(id, datos, fn) {
  const cont = $(id);
  if (!datos || !datos.length) return false;
  datos.forEach(d => cont.appendChild(fn(d)));
  return true;
}

/* ---------- Perfil ---------- */
const k = CV.contacto;
[["📍", k.ubicacion], ["✉️", k.correo], ["📞", k.telefono]].forEach(([i, v]) => { if (v) $("#datos").appendChild(crear("span", "chip", `${i} ${v}`)); });

/* ---------- Línea de tiempo ---------- */
linea("#lista-exp", CV.experiencia, e => crear("article", "item",
  `<span class="fecha">${e.fecha}</span><h4>${e.cargo}</h4><p class="lugar">${e.lugar}</p>` +
  `<ul>${(e.detalles || []).map(d => `<li>${d}</li>`).join("")}</ul>`)) || ocultar("experiencia");

const hayEdu = linea("#lista-edu", CV.educacion, e => crear("article", "item",
  `<span class="fecha">${e.fecha}</span><h4>${e.titulo}</h4><p class="lugar">${e.lugar}</p>`));
const hayCur = linea("#lista-cursos", CV.cursos, e => crear("article", "item",
  `<span class="fecha">${e.fecha}</span><h4>${e.titulo}</h4><p class="lugar">${e.lugar}</p>`));
if (!hayCur) { $("#t-cursos").style.display = "none"; }
if (!hayEdu && !hayCur) ocultar("educacion");

/* ---------- Habilidades ---------- */
const barra = (n, v, txt) => crear("div", "barra",
  `<div class="barra-txt"><span>${n}</span><span>${txt || v + "%"}</span></div><div class="pista"><div class="relleno" data-nivel="${v}"></div></div>`);
linea("#barras", CV.habilidades, h => barra(h.nombre, h.nivel));
linea("#blandas", CV.blandas, b => crear("span", "chip", b));
linea("#idiomas", CV.idiomas, i => barra(i.nombre, i.nivel, i.texto));
if (!CV.habilidades.length && !CV.blandas.length && !CV.idiomas.length) ocultar("habilidades");

/* ---------- Proyectos y contacto ---------- */
linea("#lista-proy", CV.proyectos, p => crear("article", "tarjeta",
  `<h4>${p.titulo}</h4><p>${p.descripcion}</p>${p.enlace ? `<a href="${p.enlace}" target="_blank" rel="noopener">Ver más →</a>` : ""}`)) || ocultar("proyectos");

const cont = $("#contacto-lista");
if (k.correo) cont.appendChild(crear("a", "tarjeta", `<h4>✉️ Correo</h4><p>${k.correo}</p>`)).href = "mailto:" + k.correo;
if (k.telefono) cont.appendChild(crear("a", "tarjeta", `<h4>📞 Teléfono</h4><p>${k.telefono}</p>`)).href = "tel:" + k.telefono.replace(/[^\d+]/g, "");
(CV.redes || []).forEach(s => { const a = cont.appendChild(crear("a", "tarjeta", `<h4>🔗 ${s.nombre}</h4><p>Visitar perfil</p>`)); a.href = s.url; a.target = "_blank"; a.rel = "noopener"; });

/* ---------- Descargar CV ---------- */
$("#descargar").addEventListener("click", () => {
  if (CV.cvPdf) { const a = crear("a"); a.href = CV.cvPdf; a.download = ""; a.click(); }
  else window.print();
});

/* ---------- Tema claro/oscuro ---------- */
const aplicarTema = t => { document.documentElement.dataset.tema = t; $("#tema").textContent = t === "oscuro" ? "☀️" : "🌙"; try { localStorage.setItem("tema", t); } catch (e) {} };
let guardado = null; try { guardado = localStorage.getItem("tema"); } catch (e) {}
aplicarTema(guardado || (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro"));
$("#tema").addEventListener("click", () => aplicarTema(document.documentElement.dataset.tema === "oscuro" ? "claro" : "oscuro"));

/* ---------- Menú móvil, subir y animaciones ---------- */
$("#menuBtn").addEventListener("click", () => $("#menu").classList.toggle("abierto"));
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => $("#menu").classList.remove("abierto")));
$("#subir").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
addEventListener("scroll", () => $("#subir").classList.toggle("ver", scrollY > 500));

const obs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("visible");
  e.target.querySelectorAll(".relleno").forEach(b => b.style.width = b.dataset.nivel + "%");
  obs.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(s => obs.observe(s));
addEventListener("beforeprint", () => document.querySelectorAll(".relleno").forEach(b => b.style.width = b.dataset.nivel + "%"));
