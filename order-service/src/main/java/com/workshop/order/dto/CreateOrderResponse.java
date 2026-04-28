package com.workshop.order.dto;

public class CreateOrderResponse {
    private Long   orderId;
    private String orderNumber;
    private String status;      // echo back resolved status (optional but useful)

    public CreateOrderResponse() {}

    public CreateOrderResponse(Long orderId, String orderNumber, String status) {
        this.orderId      = orderId;
        this.orderNumber  = orderNumber;
        this.status       = status;
    }

    // keep old 2-arg constructor for backward compat
    public CreateOrderResponse(Long orderId, String orderNumber) {
        this(orderId, orderNumber, null);
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}