package bfg.backend.repository.link;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;

@Entity
public class Link {

    @EmbeddedId
    private PrimaryKey primaryKey;

    public static class PrimaryKey{
        private Integer type;
        private Long id_user;
        private Integer id_zone1;
        private Integer id_zone2;

        public PrimaryKey(Integer type, Long id_user, Integer id_zone1, Integer id_zone2) {
            this.type = type;
            this.id_user = id_user;
            this.id_zone1 = id_zone1;
            this.id_zone2 = id_zone2;
        }

        public PrimaryKey() {}

        public Integer getType() {
            return type;
        }

        public void setType(Integer type) {
            this.type = type;
        }

        public Long getId_user() {
            return id_user;
        }

        public void setId_user(Long id_user) {
            this.id_user = id_user;
        }

        public Integer getId_zone1() {
            return id_zone1;
        }

        public void setId_zone1(Integer id_zone1) {
            this.id_zone1 = id_zone1;
        }

        public Integer getId_zone2() {
            return id_zone2;
        }

        public void setId_zone2(Integer id_zone2) {
            this.id_zone2 = id_zone2;
        }
    }

    public Link(PrimaryKey primaryKey) {
        this.primaryKey = primaryKey;
    }

    public Link() {}

    public PrimaryKey getPrimaryKey() {
        return primaryKey;
    }

    public void setPrimaryKey(PrimaryKey primaryKey) {
        this.primaryKey = primaryKey;
    }
}
