package bfg.backend.service.logic.zones;

public class Cell {
    private final Integer height;
    private final Double angle;
    private final Integer widthSecond;
    private final Integer longitudeSecond;

    public Integer getWidthSecond() {
        return widthSecond;
    }

    public Integer getHeight() {
        return height;
    }

    public Double getAngle() {
        return angle;
    }

    public Integer getLongitudeSecond() {
        return longitudeSecond;
    }

    public Cell(String content){
        String[] c = content.split(" ");
        height = Integer.parseInt(c[0]);
        angle = Double.parseDouble(c[1]);
        widthSecond = Integer.parseInt(c[2]);
        longitudeSecond = Integer.parseInt(c[3]);
    }
}
