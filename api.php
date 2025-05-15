<?php
// --- INICIO: Configuración de Errores para Depuración ---
error_reporting(E_ALL); // Reportar todos los errores
ini_set('display_errors', 1); // MOSTRAR errores al navegador/usuario (para depuración)
ini_set('log_errors', 1); // SÍ registrar errores en el log
// Opcional: Especificar archivo de log (si no está configurado en php.ini)
// Asegúrate de que el servidor Apache tenga permisos para escribir en este archivo/directorio
// ini_set('error_log', 'C:/xampp/htdocs/mi-data-app/php_error.log');

// --- FIN: Configuración de Errores ---

// --- Configuración DB ---
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'datamesh'; // <<< MODIFICADO DE VUELTA A 'datamesh' (Verifica si es 'mi_data_app' para ti)

// --- Cabeceras CORS y JSON ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Conexión MySQLi ---
$conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name);
if (!$conn) {
    http_response_code(500);
    echo json_encode(['message' => 'Error de conexión DB: ' . mysqli_connect_error()]);
    exit;
}
mysqli_set_charset($conn, 'utf8mb4');

// --- Leer Acción y Datos ---
$action = $_GET['action'] ?? null;
$request_data = json_decode(file_get_contents('php://input'), true);

// --- Leer 'action' del cuerpo si es POST/PUT/DELETE y no está en GET ---
if ($action === null && ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'DELETE') && isset($request_data['action'])) {
    $action = $request_data['action'];
}
// --- FIN LECTURA 'action' DEL CUERPO ---

// --- Funciones Helper ---
function noContieneNumeros($texto)
{
    if ($texto === null)
        return true;
    return !preg_match('/\d/', $texto);
}
function generateUuidV4()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
}

// --- Procesar Acción ---
$response = ['message' => 'Acción no válida'];
$status_code = 400;
try {
    error_log("API recibió acción: '" . ($action ?? 'NULL') . "' con método: " . $_SERVER['REQUEST_METHOD']);
    if ($request_data) { error_log("API recibió datos del cuerpo: " . json_encode($request_data)); }


    switch ($action) {
        // == DOMINIOS ==
        case 'get_domains':
        // Modificamos la consulta para incluir el nombre del dominio padre
        $sql = "SELECT d.*, dp.nombre_dominio as nombre_dominio_padre 
                FROM Dominio d
                LEFT JOIN Dominio dp ON d.id_dominio_padre = dp.id_dominio
                ORDER BY d.nombre_dominio";
        $result = mysqli_query($conn, $sql);
        if (!$result)
            throw new Exception("Error al obtener dominios: " . mysqli_error($conn));
        $response = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $status_code = 200;
        break;

        case 'add_domain':
            // Validar nuevos campos
            if (
                !isset($request_data['nombre_dominio'], $request_data['descripcion_dominio'], $request_data['identificacion_dominio'], $request_data['tipo_entidad']) ||
                empty(trim($request_data['nombre_dominio'])) ||
                empty(trim($request_data['identificacion_dominio'])) ||
                !in_array($request_data['tipo_entidad'], ['Dominio', 'Equipo'])
                // Decide si mantienes la validación noContieneNumeros para nombre_dominio
                // || !noContieneNumeros($request_data['nombre_dominio'])
            ) {
                $response = ['message' => 'Datos inválidos. Nombre, identificación y tipo son requeridos. Nombre no debe contener solo números.'];
                $status_code = 400;
                break;
            }

            $nombre = mysqli_real_escape_string($conn, trim($request_data['nombre_dominio']));
            $desc = mysqli_real_escape_string($conn, trim($request_data['descripcion_dominio']));
            $identificacion = mysqli_real_escape_string($conn, trim($request_data['identificacion_dominio']));
            $tipo_entidad = mysqli_real_escape_string($conn, $request_data['tipo_entidad']);
            
            // id_dominio_padre es opcional
            $id_padre_val = $request_data['id_dominio_padre'] ?? null;
            $id_padre = ($id_padre_val !== null && $id_padre_val !== '') ? (int)$id_padre_val : null;
            $id_padre_sql = $id_padre === null ? "NULL" : $id_padre;

            // Verificar unicidad de identificacion_dominio (la BD ya tiene UNIQUE constraint, pero es bueno chequear antes)
            $check_ident_sql = "SELECT id_dominio FROM Dominio WHERE identificacion_dominio = '$identificacion'";
            $check_ident_res = mysqli_query($conn, $check_ident_sql);
            if (mysqli_num_rows($check_ident_res) > 0) {
                throw new Exception("La identificación '$identificacion' ya existe.");
            }

            $sql = "INSERT INTO Dominio (nombre_dominio, descripcion_dominio, identificacion_dominio, id_dominio_padre, tipo_entidad) 
                    VALUES ('$nombre', '$desc', '$identificacion', $id_padre_sql, '$tipo_entidad')";
            
            if (mysqli_query($conn, $sql)) {
                $response = ['message' => ucfirst($tipo_entidad) . ' creado', 'id' => mysqli_insert_id($conn)];
                $status_code = 201;
            } else {
                if (mysqli_errno($conn) == 1062) { // Error de clave única (probablemente identificacion_dominio)
                    throw new Exception("Error: La identificación '$identificacion' ya está en uso.");
                }
                throw new Exception("Error al crear: " . mysqli_error($conn));
            }
            break;

        case 'update_domain':
            if (
                !isset($request_data['id_dominio'], $request_data['nombre_dominio'], $request_data['descripcion_dominio'], $request_data['identificacion_dominio'], $request_data['tipo_entidad']) ||
                empty(trim($request_data['nombre_dominio'])) ||
                empty(trim($request_data['identificacion_dominio'])) ||
                !in_array($request_data['tipo_entidad'], ['Dominio', 'Equipo'])
                // || !noContieneNumeros($request_data['nombre_dominio'])
            ) {
                $response = ['message' => 'Datos inválidos para actualizar. ID, nombre, identificación y tipo son requeridos.'];
                $status_code = 400;
                break;
            }

            $id = (int) $request_data['id_dominio'];
            $nombre = mysqli_real_escape_string($conn, trim($request_data['nombre_dominio']));
            $desc = mysqli_real_escape_string($conn, trim($request_data['descripcion_dominio']));
            $identificacion = mysqli_real_escape_string($conn, trim($request_data['identificacion_dominio']));
            $tipo_entidad = mysqli_real_escape_string($conn, $request_data['tipo_entidad']);
            
            $id_padre_val = $request_data['id_dominio_padre'] ?? null;
            $id_padre = ($id_padre_val !== null && $id_padre_val !== '') ? (int)$id_padre_val : null;

            // Evitar que un dominio sea su propio padre
            if ($id_padre !== null && $id_padre == $id) {
                throw new Exception("Una entidad no puede ser su propio padre.");
            }
            $id_padre_sql = $id_padre === null ? "NULL" : $id_padre;

            // Verificar unicidad de identificacion_dominio (excluyendo el registro actual)
            $check_ident_sql = "SELECT id_dominio FROM Dominio WHERE identificacion_dominio = '$identificacion' AND id_dominio != $id";
            $check_ident_res = mysqli_query($conn, $check_ident_sql);
            if (mysqli_num_rows($check_ident_res) > 0) {
                throw new Exception("La identificación '$identificacion' ya existe para otra entidad.");
            }

            $sql = "UPDATE Dominio SET 
                        nombre_dominio = '$nombre', 
                        descripcion_dominio = '$desc',
                        identificacion_dominio = '$identificacion',
                        id_dominio_padre = $id_padre_sql,
                        tipo_entidad = '$tipo_entidad'
                    WHERE id_dominio = $id";

            if (mysqli_query($conn, $sql)) {
                if (mysqli_affected_rows($conn) > 0) {
                    $response = ['message' => ucfirst($tipo_entidad) . ' actualizado'];
                } else {
                    $response = ['message' => ucfirst($tipo_entidad) . ' no encontrado o datos sin cambios'];
                }
                $status_code = 200;
            } else {
                if (mysqli_errno($conn) == 1062) {
                    throw new Exception("Error al actualizar: La identificación '$identificacion' ya está en uso.");
                }
                throw new Exception("Error al actualizar: " . mysqli_error($conn));
            }
            break;
        case 'delete_domain':
            if (isset($request_data['id_dominio'])) {
                $id = (int) $request_data['id_dominio'];
                $sql = "DELETE FROM Dominio WHERE id_dominio = $id";
                if (mysqli_query($conn, $sql)) {
                    if (mysqli_affected_rows($conn) > 0) {
                        $response = ['message' => 'Dominio eliminado'];
                        $status_code = 200;
                    } else {
                        $response = ['message' => 'Dominio no encontrado'];
                        $status_code = 404;
                    }
                } else {
                    if (mysqli_errno($conn) == 1451) { // Error de Foreign Key constraint
                        throw new Exception('No se puede eliminar: Dominio tiene Productos asociados.');
                    } else {
                        throw new Exception(mysqli_error($conn));
                    }
                }
            } else {
                $response = ['message' => 'ID de dominio requerido en el cuerpo'];
                $status_code = 400;
            }
            break;

        // == PRODUCTOS ==
        case 'get_products':
            $sql = "SELECT pd.*, d.nombre_dominio as nombre_dominio_propietario FROM ProductoDato pd JOIN Dominio d ON pd.id_dominio_propietario = d.id_dominio ORDER BY pd.nombre_producto_dato";
            $result = mysqli_query($conn, $sql);
            if (!$result)
                throw new Exception(mysqli_error($conn));
            $response = mysqli_fetch_all($result, MYSQLI_ASSOC);
            $status_code = 200;
            break;

        case 'add_product':
            if (
                empty($request_data['nombre_producto_dato']) ||
                empty($request_data['id_dominio_propietario']) || empty($request_data['tipo']) || empty($request_data['identificador_unico']) ||
                !noContieneNumeros($request_data['nombre_producto_dato']) || !noContieneNumeros($request_data['descripcion_producto_dato'] ?? '')
            ) {
                $response = ['message' => 'Datos inválidos (nombre, dueño, tipo, identificador requeridos y sin números en nombre/desc)'];
                $status_code = 400;
                break;
            }
            $nombre = mysqli_real_escape_string($conn, $request_data['nombre_producto_dato']);
            $desc_raw = $request_data['descripcion_producto_dato'] ?? null;
            $desc = $desc_raw ? "'" . mysqli_real_escape_string($conn, $desc_raw) . "'" : "NULL";
            $owner_id = (int) $request_data['id_dominio_propietario'];
            $tipo = mysqli_real_escape_string($conn, $request_data['tipo']);
            $identificador = mysqli_real_escape_string($conn, $request_data['identificador_unico']);
            $estado = isset($request_data['estado']) && $request_data['estado'] !== '' ? "'" . mysqli_real_escape_string($conn, $request_data['estado']) . "'" : "NULL";
            $sql = "INSERT INTO ProductoDato (nombre_producto_dato, descripcion_producto_dato, id_dominio_propietario, tipo, identificador_unico, estado) VALUES ('$nombre', $desc, $owner_id, '$tipo', '$identificador', $estado)";
            if (mysqli_query($conn, $sql)) {
                $response = ['message' => 'Producto creado', 'id' => mysqli_insert_id($conn)];
                $status_code = 201;
            } else {
                if (mysqli_errno($conn) == 1062) { // Error de clave única duplicada
                    throw new Exception("Error: El identificador único '$identificador' ya existe.");
                } else {
                    throw new Exception(mysqli_error($conn));
                }
            }
            break;

        case 'delete_product':
            if (isset($request_data['id_producto_dato'])) {
                $id = (int) $request_data['id_producto_dato'];
                $sql = "DELETE FROM ProductoDato WHERE id_producto_dato = $id";
                $result = mysqli_query($conn, $sql);
                if ($result) {
                    if (mysqli_affected_rows($conn) > 0) {
                        $response = ['message' => 'Producto eliminado'];
                        $status_code = 200;
                    } else {
                        $response = ['message' => 'Producto no encontrado'];
                        $status_code = 404;
                    }
                } else {
                    throw new Exception(mysqli_error($conn));
                }
            } else {
                $response = ['message' => 'ID de producto requerido en el cuerpo'];
                $status_code = 400;
            }
            break;
        
        case 'update_product':
            // Asegurarse de que el ID del producto está presente
            if (!isset($request_data['id_producto_dato'])) {
                $response = ['message' => 'ID de producto requerido para actualizar'];
                $status_code = 400;
                break;
            }
            $id = (int) $request_data['id_producto_dato'];

            // Validaciones (similares a add_product, pero para los campos que permites actualizar)
            if (
                empty($request_data['nombre_producto_dato']) ||
                empty($request_data['id_dominio_propietario']) ||
                !noContieneNumeros($request_data['nombre_producto_dato']) || 
                !noContieneNumeros($request_data['descripcion_producto_dato'] ?? '')
            ) {
                $response = ['message' => 'Datos inválidos para actualizar (nombre, dueño requeridos y sin números en nombre/desc)'];
                $status_code = 400;
                break;
            }

            $nombre = mysqli_real_escape_string($conn, $request_data['nombre_producto_dato']);
            $desc_raw = $request_data['descripcion_producto_dato'] ?? null;
            $desc = $desc_raw ? "'" . mysqli_real_escape_string($conn, $desc_raw) . "'" : "NULL";
            $owner_id = (int) $request_data['id_dominio_propietario'];
            
            // Campos que pueden ser nulos o vacíos
            $estado = isset($request_data['estado']) && $request_data['estado'] !== '' ? "'" . mysqli_real_escape_string($conn, $request_data['estado']) . "'" : "NULL";

            // NO PERMITIR ACTUALIZAR 'tipo' ni 'identificador_unico' desde aquí.
            // Esos campos deberían ser inmutables después de la creación.
            // Si se envían en $request_data, simplemente ignóralos en la consulta SQL UPDATE.

            $sql = "UPDATE ProductoDato SET 
                        nombre_producto_dato = '$nombre', 
                        descripcion_producto_dato = $desc, 
                        id_dominio_propietario = $owner_id, 
                        estado = $estado 
                    WHERE id_producto_dato = $id";

            if (mysqli_query($conn, $sql)) {
                if (mysqli_affected_rows($conn) > 0) {
                    $response = ['message' => 'Producto actualizado'];
                    $status_code = 200;
                } else {
                    // Podría ser que no se actualizó nada porque los datos eran iguales,
                    // o que el producto no existía.
                    // Para ser más precisos, podrías hacer un SELECT primero.
                    $response = ['message' => 'Producto no encontrado o datos sin cambios'];
                    $status_code = 200; // O 404 si estás seguro que no existe
                }
            } else {
                throw new Exception("Error al actualizar producto: " . mysqli_error($conn));
            }
            break;

        // == CONTRATOS ==
        case 'get_contracts':
            $sql = "SELECT cd.*, pd.nombre_producto_dato, dc.nombre_dominio as nombre_dominio_consumidor 
                    FROM ContratoDato cd 
                    JOIN ProductoDato pd ON cd.id_producto_dato = pd.id_producto_dato 
                    JOIN Dominio dc ON cd.id_dominio_consumidor = dc.id_dominio 
                    ORDER BY cd.fecha_de_creacion_contrato_dato DESC";
            $result = mysqli_query($conn, $sql);
            if (!$result)
                throw new Exception(mysqli_error($conn));
            $response = mysqli_fetch_all($result, MYSQLI_ASSOC);
            $status_code = 200;
            break;

        case 'add_contract':
            // Validación de datos ( frontend envía: id_producto_dato, id_dominio_consumidor, nombre_contrato_dato, descripcion_contrato_dato)
            if (
                isset($request_data['id_producto_dato'], $request_data['id_dominio_consumidor'], $request_data['nombre_contrato_dato']) &&
                // noContieneNumeros($request_data['nombre_contrato_dato']) && // Validar si el nombre debe o no contener números
                noContieneNumeros($request_data['descripcion_contrato_dato'] ?? '') // Descripción es opcional para noContieneNumeros
            ) {
                $prod_id = (int) $request_data['id_producto_dato'];
                $cons_id = (int) $request_data['id_dominio_consumidor'];
                $nombre = mysqli_real_escape_string($conn, $request_data['nombre_contrato_dato']);
                $desc_raw = $request_data['descripcion_contrato_dato'] ?? null;
                $desc = $desc_raw ? "'" . mysqli_real_escape_string($conn, $desc_raw) . "'" : "NULL";
        
                // Validación adicional: el dominio consumidor no puede ser el mismo que el propietario del producto
                $check_owner_sql = "SELECT id_dominio_propietario FROM ProductoDato WHERE id_producto_dato = $prod_id";
                $owner_result = mysqli_query($conn, $check_owner_sql);
                if ($owner_row = mysqli_fetch_assoc($owner_result)) {
                    if ($owner_row['id_dominio_propietario'] == $cons_id) {
                        throw new Exception("Un dominio no puede crear un contrato para consumir su propio producto.");
                    }
                } else {
                    throw new Exception("Producto no encontrado para validar propietario.");
                }

                $sql = "INSERT INTO ContratoDato (id_producto_dato, id_dominio_consumidor, nombre_contrato_dato, descripcion_contrato_dato) 
                        VALUES ($prod_id, $cons_id, '$nombre', $desc)";
        
                if (mysqli_query($conn, $sql)) {
                    $response = ['message' => 'Contrato creado', 'id' => mysqli_insert_id($conn)];
                    $status_code = 201;
                } else {
                    if (mysqli_errno($conn) == 1062) { // Error de clave única (producto-consumidor)
                        throw new Exception('Ya existe un contrato para este producto y consumidor.');
                    } else {
                        throw new Exception(mysqli_error($conn));
                    }
                }
            } else {
                $missing_fields = [];
                if (!isset($request_data['id_producto_dato'])) $missing_fields[] = 'id_producto_dato';
                if (!isset($request_data['id_dominio_consumidor'])) $missing_fields[] = 'id_dominio_consumidor';
                if (!isset($request_data['nombre_contrato_dato'])) $missing_fields[] = 'nombre_contrato_dato';
                // if (isset($request_data['nombre_contrato_dato']) && !noContieneNumeros($request_data['nombre_contrato_dato'])) $missing_fields[] = 'nombre_contrato_dato (formato inválido)';
                // if (isset($request_data['descripcion_contrato_dato']) && !noContieneNumeros($request_data['descripcion_contrato_dato'])) $missing_fields[] = 'descripcion_contrato_dato (formato inválido)';


                $response = ['message' => 'Datos inválidos. Campos requeridos: ' . implode(', ', $missing_fields) . '. Nombre y descripción no deben contener solo números.'];
                // La validación de noContieneNumeros para add_contract fue eliminada parcialmente en tu nuevo código PHP.
                // Ajusta el mensaje si la lógica de validación cambia.
                $status_code = 400;
            }
            break;

        default:
            $response = ['message' => 'Acción no especificada o desconocida: ' . $action];
            $status_code = 404;
            break;
    }
} catch (Exception $e) {
    error_log("API Exception: " . $e->getMessage() . " | Action: " . $action . " | Data: " . json_encode($request_data));
    $response = ['message' => 'Error en el servidor: ' . $e->getMessage()];
    //Devolver el código de estado original si es un error de validación del cliente
    if ($status_code == 400 && strpos($e->getMessage(), "Un dominio no puede crear un contrato") !== false) {
         // Mantener 400 si es este error específico
    } else {
        $status_code = 500; // Error interno del servidor para otros casos
    }
}

// --- Cerrar Conexión y Enviar Respuesta ---
mysqli_close($conn);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("❌ JSON error antes de enviar respuesta: " . json_last_error_msg() . " | Respuesta: " . print_r($response, true));
    // No intentes enviar json_encode($response) si ya falló, podría empeorar el error.
    // Considera enviar un error genérico si esto ocurre.
}
http_response_code($status_code);
echo json_encode($response);
?>