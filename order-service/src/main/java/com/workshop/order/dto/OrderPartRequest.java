package com.workshop.order.dto;

public class OrderPartRequest {

    private String  partNo;       // → order_parts.part_number
    private String  description;  // → order_parts.description
    private Integer quantity;     // → order_parts.quantity
    private String  unit;         // → order_parts.unit         (NEW — pcs/ltr/set/kg/m)
    private Double  unitPrice;    // → order_parts.unit_price   (renamed from price)

    public OrderPartRequest() {}

    public OrderPartRequest(String partNo, String description,
                            Integer quantity, String unit, Double unitPrice) {
        this.partNo      = partNo;
        this.description = description;
        this.quantity    = quantity;
        this.unit        = unit;
        this.unitPrice   = unitPrice;
    }

    public String getPartNo() { return partNo; }
    public void setPartNo(String partNo) { this.partNo = partNo; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
}