package bfg.backend.dto.responce;

public class ModuleTypeDTO {
    private Integer id;
    private String name;
    private Integer peopleRequired;
    private Integer cost;
    private Boolean isLivingModule;

    public ModuleTypeDTO() {
    }

    public ModuleTypeDTO(Integer id, String name, Integer peopleRequired, Integer cost, Boolean isLivingModule) {
        this.id = id;
        this.name = name;
        this.peopleRequired = peopleRequired;
        this.cost = cost;
        this.isLivingModule = isLivingModule;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPeopleRequired() {
        return peopleRequired;
    }

    public void setPeopleRequired(Integer peopleRequired) {
        this.peopleRequired = peopleRequired;
    }

    public Integer getCost() {
        return cost;
    }

    public void setCost(Integer cost) {
        this.cost = cost;
    }

    public Boolean getIsLivingModule() {
        return isLivingModule;
    }

    public void setIsLivingModule(Boolean livingModule) {
        isLivingModule = livingModule;
    }
}