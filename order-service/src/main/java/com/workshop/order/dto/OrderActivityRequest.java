package com.workshop.order.dto;

public class OrderActivityRequest {

    private String activityCode;  // → order_activity_lines.activity_code
    private String description;   // → order_activity_lines.description
    private String hours;         // → order_activity_lines.hours
    private String hourlyRate;    // → order_activity_lines.hourly_rate

    public OrderActivityRequest() {}

    public OrderActivityRequest(String activityCode, String description,
                                String hours, String hourlyRate) {
        this.activityCode = activityCode;
        this.description  = description;
        this.hours        = hours;
        this.hourlyRate   = hourlyRate;
    }

    public String getActivityCode() { return activityCode; }
    public void setActivityCode(String activityCode) { this.activityCode = activityCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }

    public String getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(String hourlyRate) { this.hourlyRate = hourlyRate; }
}