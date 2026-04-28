package com.workshop.order.dto;

import java.util.List;

public class CreateOrderRequest {

    // ── Planning-flow fields ──────────────────────────────────────────────────
    private Long    planningId;
    private String  license;
    private String  customerName;
    private String  customerNumber;
    private Integer carMileage;
    private String  carMake;

    // ── React frontend fields ─────────────────────────────────────────────────
    private String customerId;
    private String carId;
    private String serviceType;
    private String status;       // defaults to "Pending" in DB, optional here
    private String notes;
    private String price;
    private String createdAt;

    // ── Line items ────────────────────────────────────────────────────────────
    private List<OrderPartRequest>     parts;
    private List<OrderActivityRequest> activities;

    public CreateOrderRequest() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getPlanningId() { return planningId; }
    public void setPlanningId(Long planningId) { this.planningId = planningId; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerNumber() { return customerNumber; }
    public void setCustomerNumber(String customerNumber) { this.customerNumber = customerNumber; }

    public Integer getCarMileage() { return carMileage; }
    public void setCarMileage(Integer carMileage) { this.carMileage = carMileage; }

    public String getCarMake() { return carMake; }
    public void setCarMake(String carMake) { this.carMake = carMake; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCarId() { return carId; }
    public void setCarId(String carId) { this.carId = carId; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<OrderPartRequest> getParts() { return parts; }
    public void setParts(List<OrderPartRequest> parts) { this.parts = parts; }

    public List<OrderActivityRequest> getActivities() { return activities; }
    public void setActivities(List<OrderActivityRequest> activities) { this.activities = activities; }
}