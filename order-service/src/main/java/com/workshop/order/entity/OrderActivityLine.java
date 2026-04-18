package com.workshop.order.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "order_activity_lines")
public class OrderActivityLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String activityCode;
    private String description;
    private String hours;
    private String hourlyRate;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference("order-activitylines")
    private Order order;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActivityCode() { return activityCode; }
    public void setActivityCode(String activityCode) { this.activityCode = activityCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }

    public String getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(String hourlyRate) { this.hourlyRate = hourlyRate; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}