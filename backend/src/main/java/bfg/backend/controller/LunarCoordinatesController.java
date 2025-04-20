package bfg.backend.controller;

import bfg.backend.service.logic.zones.Area;
import bfg.backend.service.logic.zones.Zones;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/lunar-coordinates")
public class LunarCoordinatesController {

    @GetMapping("/{id_zone}/{x}/{y}")
    public ResponseEntity<Map<String, Object>> getLunarCoordinates(
            @PathVariable int id_zone,
            @PathVariable int x,
            @PathVariable int y) {

        try {
            if (id_zone < 0 || id_zone >= Zones.getLength()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid zone ID"));
            }

            // Получаем зону по ID
            Area area = Zones.getZones().get(id_zone);
            
            // Вычисляем реальные лунные координаты
            double[] lunarCoords = calculateLunarCoordinates(x, y);
            
            // Форматируем координаты для ответа
            String latitude = formatCoordinate(lunarCoords[0], "S");
            String longitude = formatCoordinate(lunarCoords[1], "E");
            
            Map<String, Object> response = new HashMap<>();
            response.put("latitude", latitude);
            response.put("longitude", longitude);
            response.put("zone", area.getName());
            response.put("raw_latitude", lunarCoords[0]);
            response.put("raw_longitude", lunarCoords[1]);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Вычисляет реальные лунные координаты на основе игровых координат
     * @param x координата X в игровом мире
     * @param y координата Y в игровом мире
     * @return массив из двух чисел [широта, долгота]
     */
    private double[] calculateLunarCoordinates(int x, int y) {
        double[] coordinates = new double[2];
        
        // Реализация алгоритма из Python-скрипта get_coordinates.py
        
        // Расчет широты: -90° + (5 * sqrt(x² + y²) / 8.416)
        double second = 8.416;
        double b = (-90 * 3600) + 5 * Math.sqrt(x * x + y * y) / second;
        double latitude = b / 3600; // Переводим из секунд в градусы
        
        // Расчет долготы
        double longitude;
        if (x == y) {
            if (x > 0) longitude = 45;
            else if (x < 0) longitude = -135;
            else longitude = 0;
        } else if (x == 0) {
            if (y > 0) longitude = 0;
            else longitude = 180;
        } else if (y == 0) {
            if (x > 0) longitude = 90;
            else longitude = -90;
        } else {
            double a = Math.atan((double) x / y) * 180 / Math.PI;
            if (y < 0) {
                if (x > 0) a = 180 + a;
                else a = -180 + a;
            }
            longitude = a;
        }
        
        coordinates[0] = latitude;
        coordinates[1] = longitude;
        
        return coordinates;
    }
    
    /**
     * Форматирует координату в строку вида "XX°YY'ZZ" S/E"
     * @param coordinate координата в градусах
     * @param direction направление (N, S, E, W)
     * @return отформатированная строка
     */
    private String formatCoordinate(double coordinate, String direction) {
        // Получаем абсолютное значение
        double absCoordinate = Math.abs(coordinate);
        
        // Вычисляем градусы, минуты и секунды
        int degrees = (int) absCoordinate;
        int minutes = (int) ((absCoordinate - degrees) * 60);
        int seconds = (int) (((absCoordinate - degrees) * 60 - minutes) * 60);
        
        return String.format("%d°%d'%d\" %s", degrees, minutes, seconds, direction);
    }
}