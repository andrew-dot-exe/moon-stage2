package bfg.backend.repository.user;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String password;
    private Integer current_day;
    private Integer days_before_delivery;
    private Boolean live;

    public User(Long id, String name, String email, String password, Integer current_day, Integer days_before_delivery, Boolean live) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.current_day = current_day;
        this.days_before_delivery = days_before_delivery;
        this.live = live;
    }

    public User() {}



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getCurrent_day() {
        return current_day;
    }

    public void setCurrent_day(Integer current_day) {
        this.current_day = current_day;
    }

    public Integer getDays_before_delivery() {
        return days_before_delivery;
    }

    public void setDays_before_delivery(Integer days_before_delivery) {
        this.days_before_delivery = days_before_delivery;
    }

    public Boolean getLive() {
        return live;
    }

    public void setLive(Boolean live) {
        this.live = live;
    }
}
