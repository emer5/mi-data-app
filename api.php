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
    if ($request_data) {
        error_log("API recibió datos del cuerpo: " . json_encode($request_data));
    }


    switch ($action) {
        // == DOMINIOS ==
        case 'get_domains':
            $result = mysqli_query($conn, "SELECT * FROM Dominio ORDER BY nombre_dominio");
            if (!$result)
                throw new Exception(mysqli_error($conn));
            $response = mysqli_fetch_all($result, MYSQLI_ASSOC);
            $status_code = 200;
            break;

        case 'add_domain':
            if (isset($request_data['nombre_dominio'], $request_data['descripcion_dominio']) && noContieneNumeros($request_data['nombre_dominio']) && noContieneNumeros($request_data['descripcion_dominio'])) {
                $nombre = mysqli_real_escape_string($conn, $request_data['nombre_dominio']);
                $desc = mysqli_real_escape_string($conn, $request_data['descripcion_dominio']);
                $sql = "INSERT INTO Dominio (nombre_dominio, descripcion_dominio) VALUES ('$nombre', '$desc')";
                if (mysqli_query($conn, $sql)) {
                    $response = ['message' => 'Dominio creado', 'id' => mysqli_insert_id($conn)];
                    $status_code = 201;
                } else
                    throw new Exception(mysqli_error($conn));
            } else {
                $response = ['message' => 'Datos inválidos (nombre/descripción requeridos y sin números)'];
                $status_code = 400;
            }
            break;

        case 'update_domain':
            if (isset($request_data['id_dominio'], $request_data['nombre_dominio'], $request_data['descripcion_dominio']) && noContieneNumeros($request_data['nombre_dominio']) && noContieneNumeros($request_data['descripcion_dominio'])) {
                $id = (int) $request_data['id_dominio'];
                $nombre = mysqli_real_escape_string($conn, $request_data['nombre_dominio']);
                $desc = mysqli_real_escape_string($conn, $request_data['descripcion_dominio']);
                $sql = "UPDATE Dominio SET nombre_dominio = '$nombre', descripcion_dominio = '$desc' WHERE id_dominio = $id";
                if (mysqli_query($conn, $sql)) {
                    $response = ['message' => 'Dominio actualizado'];
                    $status_code = 200;
                } else
                    throw new Exception(mysqli_error($conn));
            } else {
                $response = ['message' => 'Datos inválidos para actualizar'];
                $status_code = 400;
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
            $sql = "SELECT 
                p.id_producto_dato,
                p.nombre_producto_dato,
                p.descripcion_producto_dato,
                p.fecha_de_creacion_producto_dato,
                p.id_dominio_propietario,
                p.tipo,
                p.identificador_unico, -- 👈 Asegúrate de incluir este campo
                p.estado,
                p.tags,
                d.nombre_dominio AS nombre_dominio_propietario
            FROM ProductoDato p
            LEFT JOIN Dominio d ON p.id_dominio_propietario = d.id_dominio";

            $result = mysqli_query($conn, $sql);
            if (!$result)
                throw new Exception(mysqli_error($conn));
            $response = mysqli_fetch_all($result, MYSQLI_ASSOC);
            $status_code = 200;
            break;


case 'add_product':
    if (
        empty($request_data['nombre_producto_dato']) ||
        empty($request_data['id_dominio_propietario']) ||
        empty($request_data['tipo']) ||
        empty($request_data['identificador_unico']) ||
        !noContieneNumeros($request_data['nombre_producto_dato']) ||
        !noContieneNumeros($request_data['descripcion_producto_dato'] ?? '')
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
    $tags = isset($request_data['tags']) && $request_data['tags'] !== '' ? "'" . mysqli_real_escape_string($conn, $request_data['tags']) . "'" : "NULL";

    $sql = "INSERT INTO ProductoDato (
                nombre_producto_dato,
                descripcion_producto_dato,
                id_dominio_propietario,
                tipo,
                identificador_unico,
                estado,
                tags
            ) VALUES (
                '$nombre',
                $desc,
                $owner_id,
                '$tipo',
                '$identificador',
                $estado,
                $tags
            )";

    if (mysqli_query($conn, $sql)) {
        $response = ['message' => 'Producto creado', 'id' => mysqli_insert_id($conn)];
        $status_code = 201;
    } else {
        if (mysqli_errno($conn) == 1062) {
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

        // == CONTRATOS ==
case 'get_contracts':
    $sql = "SELECT 
                cd.*, 
                pd.nombre_producto_dato, 
                dc.nombre_dominio AS nombre_dominio_consumidor 
            FROM ContratoDato cd
            JOIN ProductoDato pd ON cd.id_producto_dato = pd.id_producto_dato
            JOIN Dominio dc ON cd.id_dominio_consumidor = dc.id_dominio
            ORDER BY cd.fecha_de_creacion_contrato_dato DESC";

    $result = mysqli_query($conn, $sql);
    if (!$result) {
        throw new Exception(mysqli_error($conn));
    }
    $response = mysqli_fetch_all($result, MYSQLI_ASSOC);
    $status_code = 200;
    break;

case 'add_contract':
    if (
        isset($request_data['id_producto_dato'], $request_data['id_dominio_consumidor'], $request_data['nombre_contrato_dato']) &&
        noContieneNumeros($request_data['nombre_contrato_dato'])
    ) {
        $prod_id = (int) $request_data['id_producto_dato'];
        $cons_id = (int) $request_data['id_dominio_consumidor'];
        $nombre = mysqli_real_escape_string($conn, $request_data['nombre_contrato_dato']);
        $desc_raw = $request_data['descripcion_contrato_dato'] ?? null;
        $desc = $desc_raw ? "'" . mysqli_real_escape_string($conn, $desc_raw) . "'" : "NULL";

        // Campos adicionales
        $uso = mysqli_real_escape_string($conn, $request_data['uso'] ?? '');
        $proposito = mysqli_real_escape_string($conn, $request_data['proposito'] ?? '');
        $limitaciones = mysqli_real_escape_string($conn, $request_data['limitaciones'] ?? '');
        $precio_monto = isset($request_data['precio_monto']) ? floatval($request_data['precio_monto']) : 0;
        $precio_moneda = mysqli_real_escape_string($conn, $request_data['precio_moneda'] ?? '');
        $precio_unitario = mysqli_real_escape_string($conn, $request_data['precio_unitario'] ?? '');
        $sql = "INSERT INTO ContratoDato (
                    id_producto_dato, 
                    id_dominio_consumidor, 
                    nombre_contrato_dato, 
                    descripcion_contrato_dato,
                    uso,
                    proposito,
                    limitaciones,
                    precio_monto,
                    precio_moneda,
                    precio_unitario
                ) VALUES (
                    $prod_id, 
                    $cons_id, 
                    '$nombre', 
                    $desc,
                    '$uso',
                    '$proposito',
                    '$limitaciones',
                    $precio_monto,
                    '$precio_moneda',
                    '$precio_unitario'
                )";

        if (mysqli_query($conn, $sql)) {
            $response = ['message' => 'Contrato creado', 'id' => mysqli_insert_id($conn)];
            $status_code = 201;
        } else {
            if (mysqli_errno($conn) == 1062) {
                throw new Exception('Ya existe un contrato para este producto y consumidor.');
            } else {
                throw new Exception(mysqli_error($conn));
            }
        }
    } else {
        $response = ['message' => 'Datos inválidos: Campos requeridos. Nombre y descripción no deben contener solo números.'];
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
    if ($status_code == 400 && strpos($e->getMessage(), "Un dominio no puede crear un contrato") !== false) {
        // Mantener 400 si es este error específico
    } else {
        $status_code = 500; // Error interno del servidor para otros casos
    }
}

// --- Cerrar conexión y enviar respuesta ---
mysqli_close($conn);
http_response_code($status_code);
echo json_encode($response);
