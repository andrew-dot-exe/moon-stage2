package bfg.backend.repository.resource;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;

@Entity
public class Resource implements Comparable<Resource>{

    @EmbeddedId
    private PrimaryKey primaryKey;
    private Long count;
    private Long production;
    private Long consumption;
    private Long sum_production;
    private Long sum_consumption;

    public static class PrimaryKey implements Comparable<PrimaryKey>{
        private Integer resource_type;
        private Long id_user;

        public PrimaryKey(Integer resource_type, Long id_user) {
            this.resource_type = resource_type;
            this.id_user = id_user;
        }

        public PrimaryKey() {}

        @Override
        public int compareTo(PrimaryKey o) {
            return resource_type.compareTo(o.resource_type);
        }

        public Integer getResource_type() {
            return resource_type;
        }

        public void setResource_type(Integer resource_type) {
            this.resource_type = resource_type;
        }

        public Long getId_user() {
            return id_user;
        }

        public void setId_user(Long id_user) {
            this.id_user = id_user;
        }
    }

    public Resource(PrimaryKey primaryKey, Long count, Long production, Long consumption, Long sum_production, Long sum_consumption) {
        this.primaryKey = primaryKey;
        this.count = count;
        this.production = production;
        this.consumption = consumption;
        this.sum_production = sum_production;
        this.sum_consumption = sum_consumption;
    }

    public Resource() {}

    @Override
    public int compareTo(Resource o) {
        return primaryKey.compareTo(o.primaryKey);
    }

    public PrimaryKey getPrimaryKey() {
        return primaryKey;
    }

    public void setPrimaryKey(PrimaryKey primaryKey) {
        this.primaryKey = primaryKey;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public Long getProduction() {
        return production;
    }

    public void setProduction(Long production) {
        this.production = production;
    }

    public Long getSum_production() {
        return sum_production;
    }

    public void setSum_production(Long sum_production) {
        this.sum_production = sum_production;
    }

    public Long getSum_consumption() {
        return sum_consumption;
    }

    public void setSum_consumption(Long sum_consumption) {
        this.sum_consumption = sum_consumption;
    }

    public Long getConsumption() {
        return consumption;
    }

    public void setConsumption(Long consumption) {
        this.consumption = consumption;
    }
}
