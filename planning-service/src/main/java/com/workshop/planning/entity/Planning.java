package com.workshop.planning.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "plannings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Planning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "planning_number", unique = true, nullable = false)
    private String planningNumber;

    @Column(name = "planning_date")
    private LocalDateTime planningDate;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "car_id")
    private String carId;

    @Column(name = "service_type")
    private String serviceType;

    private Integer duration;

    private String notes;

    private String license;
    private String customerName;
    private String customerNumber;
    private Integer carMileage;
    private String carMake;

    private String status = "DRAFT";
    private Long orderId;

    @OneToMany(mappedBy = "planning", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PlanningLine> lines;

    // getters and setters

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlanningNumber() {
        return this.planningNumber;
    }

    public void setPlanningNumber(String planningNumber) {
        this.planningNumber = planningNumber;
    }

    public String getLicense() {
        return this.license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getCustomerName() {
        return this.customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerNumber() {
        return this.customerNumber;
    }

    public void setCustomerNumber(String customerNumber) {
        this.customerNumber = customerNumber;
    }

    public Integer getCarMileage() {
        return this.carMileage;
    }

    public void setCarMileage(Integer carMileage) {
        this.carMileage = carMileage;
    }

    public String getCarMake() {
        return this.carMake;
    }

    public void setCarMake(String carMake) {
        this.carMake = carMake;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getOrderId() {
        return this.orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public List<PlanningLine> getLines() {
        return this.lines;
    }
    public void setLines(List<PlanningLine> lines) {
        this.lines = lines;
    }

    public LocalDateTime getPlanningDate() {
        return planningDate;
    }

    public void setPlanningDate(LocalDateTime planningDate) {
        this.planningDate = planningDate;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getCarId() {
        return carId;
    }

    public void setCarId(String carId) {
        this.carId = carId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    
}
