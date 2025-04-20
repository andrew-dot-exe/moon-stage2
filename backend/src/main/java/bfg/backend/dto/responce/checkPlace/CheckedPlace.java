package bfg.backend.dto.responce.checkPlace;

public record CheckedPlace (Boolean possible,
                            Integer relief,
                            Integer rationality,
                            Double height,
                            Double angle,
                            Integer illumination,
                            String zoneName,
                            Double lunarLatitude,
                            Double lunarLongitude,
                            Boolean isFlatArea) {
    
    /**
     * Создает основной объект CheckedPlace с базовыми данными
     */
    public CheckedPlace(Boolean possible, Integer relief, Integer rationality) {
        this(possible, relief, rationality, null, null, null, null, null, null, null);
    }
    
    /**
     * Создает полный объект CheckedPlace со всеми данными о ячейке
     */
    public static CheckedPlace full(Boolean possible, Integer relief, Integer rationality, 
                              Double height, Double angle, Integer illumination,
                              String zoneName, Double lunarLatitude, Double lunarLongitude,
                              Boolean isFlatArea) {
        return new CheckedPlace(possible, relief, rationality, height, angle, 
                         illumination, zoneName, lunarLatitude, lunarLongitude, isFlatArea);
    }
    
    /**
     * Создает объект с заглушками для тестирования
     */
    public static CheckedPlace stub() {
        return new CheckedPlace(true, 1, 50, 10.0, 0.5, 40, 
                         "Равнина 1", 25.5, 45.7, true);
    }
}
