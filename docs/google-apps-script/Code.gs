/**
 * Puente entre Calendario Edu y tu Google Calendar (cuenta de FEN).
 *
 * Corre dentro de tu cuenta de Google (Apps Script), no en Google Cloud. La app lo llama
 * por HTTPS con un secreto compartido; sin el secreto responde "no autorizado".
 *
 * Acciones (POST con JSON): list, create, update, delete.
 * Limitaciones deliberadas: no edita eventos recurrentes, de día completo ni ajenos
 * (de los que no eres organizador).
 */

var TZ = 'America/Santiago';
var FMT = "yyyy-MM-dd'T'HH:mm:ss";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || body.secret !== secret) return out_({ ok: false, error: 'no autorizado' });

    switch (body.action) {
      case 'list':   return out_({ ok: true, events: list_(body.from, body.to) });
      case 'create': return out_(create_(body));
      case 'update': return out_(update_(body));
      case 'delete': return out_(delete_(body));
      default:       return out_({ ok: false, error: 'acción desconocida' });
    }
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

// Permite comprobar en el navegador que el despliegue está vivo (no entrega datos).
function doGet() {
  return out_({ ok: true, servicio: 'calendario-edu-puente' });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function parse_(local) {
  return Utilities.parseDate(local, TZ, FMT);
}

function cal_() {
  return CalendarApp.getDefaultCalendar();
}

function list_(from, to) {
  var events = cal_().getEvents(parse_(from), parse_(to));
  var res = [];
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    // Omitir las que rechazaste.
    if (ev.getMyStatus() === CalendarApp.GuestStatus.NO) continue;
    var allDay = ev.isAllDayEvent();
    var start = allDay ? ev.getAllDayStartDate() : ev.getStartTime();
    var end = allDay ? ev.getAllDayEndDate() : ev.getEndTime();
    res.push({
      id: ev.getId(),
      title: ev.getTitle(),
      start: Utilities.formatDate(start, TZ, FMT),
      end: Utilities.formatDate(end, TZ, FMT),
      allDay: allDay,
      location: ev.getLocation() || '',
      recurring: ev.isRecurringEvent(),
      owned: ev.isOwnedByMe(),
      private: ev.getVisibility() === CalendarApp.Visibility.PRIVATE ||
               ev.getVisibility() === CalendarApp.Visibility.CONFIDENTIAL,
      transparent: ev.getTransparency() === CalendarApp.EventTransparency.TRANSPARENT
    });
  }
  return res;
}

function editable_(ev) {
  if (!ev) return 'no se encontró el evento';
  if (ev.isRecurringEvent()) return 'es un evento recurrente: edítalo en Google Calendar';
  if (ev.isAllDayEvent()) return 'es un evento de día completo: edítalo en Google Calendar';
  if (!ev.isOwnedByMe()) return 'no eres el organizador de este evento';
  return null;
}

function create_(b) {
  var ev = cal_().createEvent(b.title, parse_(b.start), parse_(b.end), { location: b.location || '' });
  return { ok: true, id: ev.getId() };
}

function update_(b) {
  var ev = cal_().getEventById(b.id);
  var why = editable_(ev);
  if (why) return { ok: false, error: why };
  if (b.title != null) ev.setTitle(b.title);
  if (b.location != null) ev.setLocation(b.location);
  if (b.start && b.end) ev.setTime(parse_(b.start), parse_(b.end));
  return { ok: true, id: ev.getId() };
}

function delete_(b) {
  var ev = cal_().getEventById(b.id);
  var why = editable_(ev);
  if (why) return { ok: false, error: why };
  ev.deleteEvent();
  return { ok: true };
}
