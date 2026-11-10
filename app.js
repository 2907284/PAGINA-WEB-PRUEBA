/* Rellena la web con los datos de datos.js. No hace falta tocar este archivo. */
(function () {
  "use strict";
  var D = window.DATOS || {};

  function limpio(v) { return (v === undefined || v === null) ? "" : String(v).trim(); }
  var tel = limpio(D.telefono).replace(/\D/g, "");
  var prefijo = limpio(D.prefijoPais || "34").replace(/\D/g, "");
  var telOk = tel.length >= 9;

  function telVisible() {
    if (!tel) return "";
    return tel.replace(/(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");
  }
  function direccionCompleta() {
    var cpPob = [limpio(D.codigoPostal), limpio(D.poblacion)].filter(Boolean).join(" ");
    var partes = [limpio(D.direccion), cpPob];
    if (limpio(D.provincia) && limpio(D.provincia) !== limpio(D.poblacion)) partes.push(limpio(D.provincia));
    return partes.filter(Boolean).join(", ");
  }

  var valores = {
    titular: limpio(D.titular),
    nombreComercial: limpio(D.nombreComercial),
    nombre: limpio(D.nombreComercial) || limpio(D.titular),
    nif: limpio(D.nif),
    direccion: direccionCompleta(),
    poblacion: limpio(D.poblacion),
    email: limpio(D.email),
    telefono: telVisible(),
    zona: limpio(D.zona) || limpio(D.poblacion),
    poblacionesZona: (D.poblacionesZona || []).filter(Boolean).join(", "),
    horario: limpio(D.horario),
    alojamiento: limpio(D.alojamiento),
    fechaTextosLegales: limpio(D.fechaTextosLegales),
    anio: String(new Date().getFullYear())
  };
  var nombresFalta = {
    titular: "tu nombre completo", nombreComercial: "nombre comercial", nombre: "nombre del negocio",
    nif: "NIF", direccion: "dirección", poblacion: "población", email: "email", telefono: "teléfono",
    zona: "zona", poblacionesZona: "poblaciones", horario: "horario", alojamiento: "alojamiento",
    fechaTextosLegales: "fecha"
  };

  // Textos
  document.querySelectorAll("[data-c]").forEach(function (el) {
    var k = el.getAttribute("data-c");
    var v = valores[k];
    if (v) {
      el.textContent = v;
      el.classList.remove("falta");
    } else if (el.hasAttribute("data-opcional")) {
      el.textContent = "";
    } else {
      el.textContent = "[Falta " + (nombresFalta[k] || k) + " en datos.js]";
      el.classList.add("falta");
    }
  });
  // Bloques que solo se ven si existe un dato
  document.querySelectorAll("[data-si]").forEach(function (el) {
    if (!valores[el.getAttribute("data-si")]) el.hidden = true;
  });

  // Enlaces
  var urlTel = telOk ? "tel:+" + prefijo + tel : "";
  var urlWa = telOk ? "https://wa.me/" + prefijo + tel : "";
  document.querySelectorAll("[data-tel]").forEach(function (a) { a.href = urlTel || "#presupuesto"; });
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = urlWa ? urlWa + "?text=" + encodeURIComponent("Hola, he visto tu web y quería pedir información.") : "#presupuesto";
    if (urlWa) { a.target = "_blank"; a.rel = "noopener"; }
  });
  document.querySelectorAll("[data-mail]").forEach(function (a) {
    if (valores.email) a.href = "mailto:" + valores.email; else a.removeAttribute("href");
  });

  // Título de la página
  if (valores.nombre) document.title = document.title.replace("{nombre}", valores.nombre);
  else document.title = document.title.replace("{nombre} · ", "");

  // Galería de trabajos (solo si hay fotos)
  var fotos = (D.fotos || []).filter(function (f) { return f && f.archivo; });
  var secTrab = document.getElementById("trabajos");
  if (secTrab && fotos.length) {
    var gal = document.getElementById("galeria");
    fotos.forEach(function (f) {
      var fig = document.createElement("figure"); fig.className = "foto";
      var img = document.createElement("img");
      img.src = f.archivo; img.loading = "lazy";
      img.alt = limpio(f.titulo) + (f.detalle ? " — " + limpio(f.detalle) : "");
      var cap = document.createElement("figcaption");
      var s = document.createElement("strong"); s.textContent = limpio(f.titulo);
      var d = document.createElement("span"); d.textContent = limpio(f.detalle);
      cap.appendChild(s); cap.appendChild(d); fig.appendChild(img); fig.appendChild(cap); gal.appendChild(fig);
    });
    secTrab.hidden = false;
    document.querySelectorAll("[data-menu-trabajos]").forEach(function (a) { a.hidden = false; });
  }

  // Opiniones (solo si hay)
  var ops = (D.opiniones || []).filter(function (o) { return o && o.texto; });
  var secOp = document.getElementById("opiniones");
  if (secOp && ops.length) {
    var lista = document.getElementById("lista-opiniones");
    ops.forEach(function (o) {
      var b = document.createElement("blockquote"); b.className = "opinion";
      var p = document.createElement("p"); p.textContent = "«" + limpio(o.texto) + "»";
      var f = document.createElement("footer");
      f.textContent = [limpio(o.autor), limpio(o.lugar)].filter(Boolean).join(" · ");
      b.appendChild(p); b.appendChild(f); lista.appendChild(b);
    });
    secOp.hidden = false;
  }

  // Formulario -> WhatsApp
  var form = document.getElementById("form-presupuesto");
  if (form) {
    var aviso = document.getElementById("aviso-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      aviso.className = "aviso-form";
      if (!telOk) {
        aviso.textContent = "El formulario aún no está activo. Llama o escribe directamente.";
        aviso.className = "aviso-form error";
        return;
      }
      var v = function (id) { var el = document.getElementById(id); return el ? limpio(el.value) : ""; };
      var lineas = [
        "Hola, quiero pedir un presupuesto:",
        "",
        "• Nombre: " + v("f-nombre"),
        "• Teléfono: " + v("f-telefono")
      ];
      if (v("f-email")) lineas.push("• Email: " + v("f-email"));
      lineas.push("• Obra: " + v("f-direccion") + ", " + v("f-poblacion"));
      lineas.push("• Trabajo: " + v("f-tipo"));
      if (v("f-m2")) lineas.push("• Superficie aprox.: " + v("f-m2") + " m²");
      if (v("f-estancias")) lineas.push("• Zonas: " + v("f-estancias"));
      lineas.push("• Plazo: " + v("f-cuando"));
      if (v("f-mensaje")) { lineas.push(""); lineas.push(v("f-mensaje")); }
      var url = urlWa + "?text=" + encodeURIComponent(lineas.join("\n"));
      var w = window.open(url, "_blank", "noopener");
      if (!w) window.location.href = url;
      aviso.textContent = "Se ha abierto WhatsApp con tu solicitud. Solo tienes que pulsar Enviar. Si no se abre, llámame al " + valores.telefono + ".";
      aviso.className = "aviso-form ok";
    });
  }
})();
