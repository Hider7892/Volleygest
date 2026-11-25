import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;

/**
 * VOLLEYGEST - servidor web sencillo para el prototipo academico.
 * Requiere JDK 17+. No requiere frameworks ni dependencias externas.
 *
 * Ejecutar desde la carpeta que contiene este archivo, index.html y styles.css:
 *   javac VolleyGestServer.java
 *   java VolleyGestServer
 * Abrir: http://localhost:8080
 *
 * Esta version entrega datos de demostracion. No guarda cambios en disco.
 */
public class VolleyGestServer {
    private static final int PORT = 8080;
    private static final Path ROOT = Path.of(".").toAbsolutePath().normalize();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", VolleyGestServer::handleRequest);
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("VOLLEYGEST disponible en http://localhost:" + PORT);
        System.out.println("Presiona Ctrl+C para detener el servidor.");
    }

    private static void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();

        if (path.equals("/api/resumen")) {
            send(exchange, 200, "application/json; charset=UTF-8",
                "{\"deportistas\":45,\"inscripciones\":38,\"recaudado\":2850000,\"entrenadores\":5}");
            return;
        }

        if (path.equals("/api/estado")) {
            send(exchange, 200, "application/json; charset=UTF-8",
                "{\"aplicacion\":\"VOLLEYGEST\",\"estado\":\"demo\",\"persistencia\":false}");
            return;
        }

        if (path.equals("/") || path.equals("/index.html")) {
            serveFile(exchange, "index.html", "text/html; charset=UTF-8");
        } else if (path.equals("/styles.css")) {
            serveFile(exchange, "styles.css", "text/css; charset=UTF-8");
        } else {
            send(exchange, 404, "text/plain; charset=UTF-8", "Recurso no encontrado");
        }
    }

    private static void serveFile(HttpExchange exchange, String filename, String contentType)
            throws IOException {
        Path file = ROOT.resolve(filename).normalize();
        if (!file.startsWith(ROOT) || !Files.exists(file)) {
            send(exchange, 404, "text/plain; charset=UTF-8",
                "No se encontro " + filename + ". Coloca los tres archivos en la misma carpeta.");
            return;
        }
        byte[] content = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.sendResponseHeaders(200, content.length);
        exchange.getResponseBody().write(content);
        exchange.close();
    }

    private static void send(HttpExchange exchange, int status, String contentType, String body)
            throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
