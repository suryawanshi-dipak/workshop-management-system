package com.workshop.planning.dto;

public class CreateOrderResponseDTO {
    private Long orderId;
    private String orderNumber;
    
    public CreateOrderResponseDTO() {
    }

    public CreateOrderResponseDTO(Long orderId, String orderNumber) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
        
}
