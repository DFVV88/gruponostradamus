<?php
// =======================================
// 📬 FORMULARIO DE CONTACTO NOSTRADAMUS
// =======================================

$to = "informes@gruponostradamus.edu.pe";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name    = strip_tags(trim($_POST["name"] ?? ''));
    $email   = filter_var($_POST["email"] ?? '', FILTER_SANITIZE_EMAIL);
    $number  = strip_tags(trim($_POST["number"] ?? ''));
    $course  = strip_tags(trim($_POST["course"] ?? ''));

    if (empty($name) || empty($email)) {
        http_response_code(400);
        echo "Por favor completa todos los campos requeridos.";
        exit;
    }

    $subject = "📩 Nuevo mensaje desde la web de Nostradamus";

    $body = "
    <html>
    <body style='font-family: Arial, sans-serif; color: #333;'>
        <h2>Nuevo mensaje desde la web:</h2>
        <p><strong>Nombre:</strong> {$name}</p>
        <p><strong>Correo:</strong> {$email}</p>
        <p><strong>Teléfono:</strong> {$number}</p>
        <p><strong>Curso:</strong> {$course}</p>
        <hr>
        <p style='font-size: 12px; color: #777;'>Enviado automáticamente desde gruponostradamus.edu.pe</p>
    </body>
    </html>
    ";

    $headers = "From: Web Nostradamus <web@gruponostradamus.edu.pe>\r\n";
    $headers .= "Reply-To: {$email}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    if (mail($to, $subject, $body, $headers)) {
        echo "✅ ¡Mensaje enviado correctamente! Te responderemos pronto.";
    } else {
        http_response_code(500);
        echo "❌ Error al enviar el mensaje. Intenta nuevamente más tarde.";
    }
} else {
    http_response_code(403);
    echo "Acceso no permitido.";
}
?>
