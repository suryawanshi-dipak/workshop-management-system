package com.workshop.order.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderNumber;

    private String license;
    private String customerName;
    private String customerNumber;
    private Integer carMileage;
    private String carMake;

    private String customerId;
    private String carId;
    private String serviceType;
    private String status;
    private String notes;
    private String price;

    // ✅ FIXED: Proper LocalDate mapping
    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderPart> parts = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("order-activitylines")
    private List<OrderActivityLine> activityLines = new ArrayList<>();

    // ================= GETTERS / SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getOrderId() { return orderNumber; }

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

    // ✅ FIXED: Correct types
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public List<OrderPart> getParts() { return parts; }
    public void setParts(List<OrderPart> parts) { this.parts = parts; }

    public List<OrderPart> getPartLines() { return parts; }
    public void setPartLines(List<OrderPart> partLines) { this.parts = partLines; }

    public List<OrderActivityLine> getActivityLines() { return activityLines; }
    public void setActivityLines(List<OrderActivityLine> activityLines) { this.activityLines = activityLines; }
}