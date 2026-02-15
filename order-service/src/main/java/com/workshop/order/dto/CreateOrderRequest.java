package com.workshop.order.dto;

import java.util.List;

public class CreateOrderRequest {
    private Long planningId;

    private String license;
    private String customerName;
    private String customerNumber;
    private Integer carMileage;
    private String carMake;

    private List<OrderPartRequest> parts;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long planningId, String license, String customerName, String customerNumber,
            Integer carMileage, String carMake, List<OrderPartRequest> parts) {
        this.planningId = planningId;
        this.license = license;
        this.customerName = customerName;
        this.customerNumber = customerNumber;
        this.carMileage = carMileage;
        this.carMake = carMake;
        this.parts = parts;
    }

    public Long getPlanningId() {
        return planningId;
    }

    public void setPlanningId(Long planningId) {
        this.planningId = planningId;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerNumber() {
        return customerNumber;
    }

    public void setCustomerNumber(String customerNumber) {
        this.customerNumber = customerNumber;
    }

    public Integer getCarMileage() {
        return carMileage;
    }

    public void setCarMileage(Integer carMileage) {
        this.carMileage = carMileage;
    }

    public String getCarMake() {
        return carMake;
    }

    public void setCarMake(String carMake) {
        this.carMake = carMake;
    }

    public List<OrderPartRequest> getParts() {
        return parts;
    }

    public void setParts(List<OrderPartRequest> parts) {
        this.parts = parts;
    }   
    
    
}
