package com.workshop.planning.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PlanningRequestDTO {

    private LocalDateTime planningDate;
    private String date;
    private String time;

    private Long customerId;
    private Long carId;

    private String serviceType;
    private Integer duration;
    private String notes;

    private List<PlanningLineDTO> lines;
    public LocalDateTime getPlanningDate() {
        return planningDate;
    }
    public void setPlanningDate(LocalDateTime planningDate) {
        this.planningDate = planningDate;
    }
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }
    public String getTime() {
        return time;
    }
    public void setTime(String time) {
        this.time = time;
    }
    public Long getCustomerId() {
        return customerId;
    }
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    public Long getCarId() {
        return carId;
    }
    public void setCarId(Long carId) {
        this.carId = carId;
    }
    public String getServiceType() {
        return serviceType;
    }
    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }
    public Integer getDuration() {
        return duration;
    }
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    public String getNotes() {
        return notes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
    }
    public List<PlanningLineDTO> getLines() {
        return lines;
    }
    public void setLines(List<PlanningLineDTO> lines) {
        this.lines = lines;
    }
}