import { drugsService } from '../services/drugs';
import { inventoriesService } from '../services/inventories';
import { appointmentsService } from '../services/appointments';
import { authService } from '../services/auth';

// Mapa de sinónimos para detectar intención del usuario
const DRUG_KEYWORDS = ['stock', 'medicamento', 'paracetamol', 'ibuprofeno', 'ciprofloxacino', 'naproxeno', 'tramadol', 'cetirizina', 'enalapril', 'domperidona', 'atorvastatina', 'levotiroxina', 'cuan', 'disponible', 'hay', 'queda', 'precio', 'costo', '1', 'uno'];
const APPOINTMENT_KEYWORDS = ['turno', 'turnos', 'cita', 'citas', 'solicitar', 'crear', 'agendar', 'pendiente', 'estado', 'mis turnos', 'historial', 'entrega', '2', 'dos'];
const INVENTORY_KEYWORDS = ['inventario', 'sede', 'sedes', 'stock bajo', 'agotado', 'reponer', '3', 'tres'];
const RECETA_KEYWORDS = ['receta', 'prescripción', 'requiere', '4', 'cuatro'];
const HELLO_KEYWORDS = ['hola', 'holi', 'buenas', 'buen día', 'buenos dias', 'hi', 'hey', 'saludos'];
const HELP_KEYWORDS = ['ayuda', 'qué puedes', 'que puedes', 'funciones', 'opciones', 'para qué sirves', 'para que sirves', 'cómo me ayudas', 'menu'];

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function containsAny(text: string, keywords: string[]): boolean {
  const norm = normalize(text);
  // Hacemos split para ver si la palabra exacta "1" o "2" coincide
  const words = norm.split(' ');
  return keywords.some(kw => norm.includes(normalize(kw)) || words.includes(kw));
}

function extractDrugName(text: string): string | null {
  const norm = normalize(text);
  // Intenta extraer el nombre del medicamento de la pregunta
  const patterns = [
    /(?:stock|precio|costo|disponible|hay|queda) (?:de |del |del medicamento )?([\w\s]+?)(?:\?|$|,|\s*ya)/i,
    /(?:receta|prescripcion) (?:el |la |para )?([\w\s]+?)(?:\?|$)/i,
    /(?:del|de la) ([\w\s]+?)(?:\?|$)/i,
  ];
  for (const p of patterns) {
    const m = norm.match(p);
    if (m && m[1] && m[1].trim().length > 2) return m[1].trim();
  }
  return null;
}

export async function getDrugiResponse(userMessage: string): Promise<string> {
  const user = authService.getUser();
  const userName = user?.name?.split(' ')[0] || 'Usuario';
  const normMessage = normalize(userMessage).trim();

  try {
    // Saludo o menú
    if (containsAny(userMessage, HELLO_KEYWORDS) || containsAny(userMessage, HELP_KEYWORDS)) {
      return `¡Hola ${userName}! 👋 Soy **Drugi**, tu asistente farmacéutico.\n\nPuedo ayudarte con las siguientes opciones, escríbeme el número o tu pregunta:\n1️⃣ Stock y precios de medicamentos\n2️⃣ Estado de tus turnos\n3️⃣ Información de inventario/sedes\n4️⃣ Consultas sobre recetas\n\n¿Qué necesitas hoy?`;
    }

    // Opcion 4 o RECETAS
    if (containsAny(userMessage, RECETA_KEYWORDS)) {
      const drugName = extractDrugName(userMessage);
      if (normMessage === '4' || normMessage === 'cuatro') {
         return `Para revisar si un medicamento necesita receta, dime el nombre. Por ejemplo: *"¿El Paracetamol requiere receta?"* o simplemente escribe *"receta ibuprofeno"*.`;
      }

      const drugsData = await drugsService.getAll(drugName ? { searchTerm: drugName } : {});
      const drugs = drugsData.items;
      if (drugs.length === 0) {
        return `🔍 No encontré medicamentos${drugName ? ` para "${drugName}"` : ''} en el catálogo.\n\nIntenta con un nombre diferente o revisa el catálogo completo.`;
      }

      const drug = drugs[0];
      if (drug.requiresPrescription) {
        return `📋 Sí, **${drug.name}** **requiere receta médica** para su dispensación.\n\nAsegúrate de adjuntar la autorización médica al crear tu turno.`;
      } else {
        return `✅ **${drug.name}** **no requiere receta médica**.\n\nPuedes solicitarlo directamente creando un turno en tu sede más cercana.`;
      }
    }

    // Opcion 2 o TURNOS
    if (containsAny(userMessage, APPOINTMENT_KEYWORDS)) {
      const role = user?.role;
      const isAdminOrPharmacist = role === 'Admin' || role === 'Pharmacist';
      
      const appointmentsData = isAdminOrPharmacist 
        ? await appointmentsService.getAll()
        : await appointmentsService.getMyAppointments();
      const appointments = appointmentsData.items;

      if (appointments.length === 0) {
        return `📋 No tienes turnos registrados aún, ${userName}.\n\nPuedes crear uno desde la sección **"Crear Turno"** del menú principal.`;
      }

      const pending = appointments.filter(a => a.status === 1).length;
      const inProcess = appointments.filter(a => a.status === 2).length;
      const delivered = appointments.filter(a => a.status === 3).length;
      const cancelled = appointments.filter(a => a.status === 4).length;

      if (isAdminOrPharmacist) {
        return `📊 **Resumen de Turnos:**\n\n• 🔵 Recibidos: ${pending}\n• ⚙️ En Proceso: ${inProcess}\n• ✅ Entregados: ${delivered}\n• ❌ Cancelados: ${cancelled}\n\nTotal: **${appointments.length} turnos**`;
      } else {
        const last = appointments[appointments.length - 1];
        const statusEmoji = ['', '🔵', '⚙️', '✅', '❌'][last.status] || '❓';
        return `📋 **Tus Turnos (${appointments.length}):**\n\n• Recibidos: ${pending}\n• En Proceso: ${inProcess}\n• Entregados: ${delivered}\n\nÚltimo turno: **#${last.id}** ${statusEmoji} ${last.statusName}\nSede: ${last.sedeName}`;
      }
    }

    // Opcion 3 o INVENTARIO
    if (containsAny(userMessage, INVENTORY_KEYWORDS)) {
      const inventory = await inventoriesService.getAll({ onlyLowStock: true });
      if (inventory.length === 0) {
        return `✅ ¡Excelente! No hay medicamentos con stock bajo en este momento.\n\nTodo el inventario está bien abastecido.`;
      }
      const list = inventory.slice(0, 5).map(i => `• ${i.drugName} (${i.sedeName}): **${i.quantity} unidades**`).join('\n');
      return `⚠️ **Sedes con Stock Bajo:**\n\n${list}${inventory.length > 5 ? `\n\n...y ${inventory.length - 5} más.` : ''}`;
    }

    // Opcion 1 o MEDICAMENTOS
    if (containsAny(userMessage, DRUG_KEYWORDS)) {
      if (normMessage === '1' || normMessage === 'uno') {
          return `💊 Para consultar el stock, escribe el nombre del medicamento que buscas. Por ejemplo: *"Stock de Paracetamol"*, o pregúntame por su precio: *"Precio de Ibuprofeno"*.`;
      }

      const drugName = extractDrugName(userMessage);
      const drugsData = await drugsService.getAll(drugName ? { searchTerm: drugName } : {});
      const drugs = drugsData.items;

      if (drugs.length === 0) {
        return `🔍 No encontré medicamentos${drugName ? ` para "${drugName}"` : ''} en el catálogo.\n\nIntenta con un nombre diferente o revisa el catálogo completo.`;
      }

      // Pregunta sobre precio
      if (containsAny(userMessage, ['precio', 'costo', 'vale', 'cuesta'])) {
        const drug = drugs[0];
        return `💰 **${drug.name} (${drug.genericName})**\n\n• Laboratorio: ${drug.laboratory}\n• Precio: **$${drug.price.toFixed(2)}**\n• Stock global: ${drug.stock} unidades\n• Receta: ${drug.requiresPrescription ? 'Sí' : 'No'}`;
      }

      // Stock general
      if (drugs.length === 1) {
        const d = drugs[0];
        const stockStatus = d.stock === 0 ? '🔴 Sin stock' : d.stock < 20 ? '🟡 Stock bajo' : '🟢 Disponible';
        return `💊 **${d.name} ${d.genericName}**\n\n• Stock disponible: **${d.stock} unidades** ${stockStatus}\n• Laboratorio: ${d.laboratory}\n• Precio: $${d.price.toFixed(2)}\n• Requiere receta: ${d.requiresPrescription ? '✅ Sí' : '❌ No'}`;
      }

      const list = drugs.slice(0, 4).map(d => {
        const s = d.stock === 0 ? '🔴' : d.stock < 20 ? '🟡' : '🟢';
        return `${s} **${d.name}**: ${d.stock} uds — $${d.price.toFixed(2)}`;
      }).join('\n');
      return `💊 **Medicamentos encontrados (${drugs.length}):**\n\n${list}${drugs.length > 4 ? `\n\n...y ${drugs.length - 4} más.` : ''}`;
    }

    // Respuesta por defecto si no entendió
    return `Lo siento ${userName}, no he logrado entenderte. 😕\n\nPuedes escribir el número de la opción que necesitas:\n1️⃣ Stock y precios de medicamentos\n2️⃣ Estado de tus turnos\n3️⃣ Información de inventario/sedes\n4️⃣ Consultas sobre recetas\n\nO puedes intentar escribiendo *"ayuda"*.`;

  } catch (err) {
    console.error('[Drugi] Error al consultar la API:', err);
    return `😔 Lo siento, tuve un problema al consultar la información. Por favor intenta de nuevo en un momento.`;
  }
}
