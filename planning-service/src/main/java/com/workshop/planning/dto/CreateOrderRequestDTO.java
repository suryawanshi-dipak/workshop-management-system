package com.workshop.planning.dto;

import java.util.List;

public class CreateOrderRequestDTO{
    private Long planningId;

    private String license;
    private String customerName;
    private String customerNumber;
    private Integer carMileage;
    private String carMake;

    private List<OrderPartResuestDTO> parts;

    public CreateOrderRequestDTO(Long planningId, String license, String customerName, String customerNumber,
            Integer carMileage, String carMake, List<OrderPartResuestDTO> parts) {
        this.planningId = planningId;
        this.license = license;
        this.customerName = customerName;
        this.customerNumber = customerNumber;
        this.carMileage = carMileage;
        this.carMake = carMake;
        this.parts = parts;
    }

    public CreateOrderRequestDTO() {
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

    public List<OrderPartResuestDTO> getParts() {
        return parts;
    }

    public void setParts(List<OrderPartResuestDTO> parts) {
        this.parts = parts;
    }   
    
    
}
