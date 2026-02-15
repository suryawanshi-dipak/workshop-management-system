package com.workshop.planning.dto;

public class OrderPartResuestDTO {
    private String partNo;
    private String description;
    private Integer quantity;
    private Double price;

    public OrderPartResuestDTO(String partNo, String description, Integer quantity, Double price) {
        this.partNo = partNo;
        this.description = description;
        this.quantity = quantity;
        this.price = price;
    }
    
    public OrderPartResuestDTO() {
    }

    public String getPartNo() {
        return partNo;
    }
    public void setPartNo(String partNo) {
        this.partNo = partNo;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Integer getQuantity() {
        return quantity;
    }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }    
}
