package bfg.backend.service.logic;

public enum TypeResources {
    H2O(600),
    FUEL(0),
    FOOD(450),
    WT(0),
    O2(0),
    CO2(0),
    GARBAGE(0),
    MATERIAL(250000);

    private final long startCount;

    TypeResources(int startCount) {
        this.startCount = startCount;
    }

    public long getStartCount() {
        return startCount;
    }
}
