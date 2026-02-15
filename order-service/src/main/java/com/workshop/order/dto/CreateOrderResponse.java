package com.workshop.order.dto;

public class CreateOrderResponse {
    private Long orderId;
    private String orderNumber;
    
    public CreateOrderResponse() {
    }

    public CreateOrderResponse(Long orderId, String orderNumber) {
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
