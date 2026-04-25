package com.workshop.planning.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.workshop.planning.client.OrderClient;
import com.workshop.planning.dto.CreateOrderRequestDTO;
import com.workshop.planning.dto.CreateOrderResponseDTO;
import com.workshop.planning.dto.OrderPartResuestDTO;
import com.workshop.planning.dto.PlanningLineDTO;
import com.workshop.planning.dto.PlanningRequestDTO;
import com.workshop.planning.entity.Planning;
import com.workshop.planning.entity.PlanningLine;
import com.workshop.planning.repository.PlanningRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;

@Service
public class PlanningService {
    
    private final PlanningRepository planningRepository;
    private final RestTemplate restTemplate;
    private final OrderClient orderClient;

    public PlanningService(PlanningRepository planningRepository, RestTemplate restTemplate, OrderClient orderClient) {
        this.planningRepository = planningRepository;
        this.restTemplate = restTemplate;
        this.orderClient = orderClient;
    }

    public Planning createPlanning(PlanningRequestDTO dto) {
        Planning p = new Planning();
        p.setPlanningNumber(generateNumber());
        apply(dto, p);
        p.setStatus("DRAFT");
        return planningRepository.save(p);
    }

    private String generateNumber() {

        String today = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = "PLN-" + today + "-";
        Long countToday = planningRepository.countByPlanningNumberStartingWith(prefix);
        long next = countToday + 1;
        return prefix + String.format("%03d", next);
    }

    // UPDATE
    public Planning updatePlanning(Long id, PlanningRequestDTO dto) {
        Planning p = getPlanning(id);
        apply(dto, p);
        return planningRepository.save(p);
    }

    // APPLY COMMON FIELDS
    private void apply(PlanningRequestDTO dto, Planning p) {

        if (dto.getPlanningDate() != null) {
            p.setPlanningDate(dto.getPlanningDate());
        } else if (dto.getDate() != null && dto.getTime() != null) {
            p.setPlanningDate(LocalDateTime.parse(
                dto.getDate() + "T" + dto.getTime() + ":00"
            ));
        }

        p.setCustomerId(dto.getCustomerId());
        p.setCarId(dto.getCarId());
        p.setServiceType(dto.getServiceType());
        p.setDuration(dto.getDuration());
        p.setNotes(dto.getNotes());

        if (dto.getLines() != null) {
            List<PlanningLine> lines = new ArrayList<>();

            for (PlanningLineDTO d : dto.getLines()) {
                PlanningLine line = mapLine(d, p);
                lines.add(line);
            }

            p.setLines(lines);
        }
    }

    private PlanningLine mapLine(PlanningLineDTO d, Planning p) {
        PlanningLine line = new PlanningLine();

        line.setLineType("PART");
        line.setItemCode(d.getItemCode());
        line.setDescription(d.getDescription());
        line.setQuantity(d.getQuantity());
        line.setPrice(d.getPrice());
        line.setPlanning(p);

        return line;
    }

    // GET BY ID
    public Planning getPlanning(Long id) {
        return planningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Planning not found"));
    }

    // GET ALL
    public List<Planning> getAllPlannings() {
        return planningRepository.findAll();
    }

    // GET BY DATE
    public List<Planning> getByDate(String date) {
        LocalDate localDate = LocalDate.parse(date);
        return planningRepository.findByPlanningDateBetween(
                localDate.atStartOfDay(),
                localDate.plusDays(1).atStartOfDay()
        );
    }

    // STATUS UPDATE
    public Planning updateStatus(Long id, String status) {
        Planning p = getPlanning(id);
        p.setStatus(status);
        return planningRepository.save(p);
    }

    // DELETE
    public void deletePlanning(Long id) {
        planningRepository.deleteById(id);
    }

    // COUNT
    public Long count() {
        return planningRepository.count();
    }

    @CircuitBreaker(name = "order-service", fallbackMethod = "orderFallback")
    @TimeLimiter(name = "orderService")
    public CompletableFuture<CreateOrderResponseDTO> createOrderFromPlanning(Long id) {

        Planning planning = getPlanning(id);
        System.out.println("createOrderFromPlanning " + planning.toString());        
        CreateOrderRequestDTO request = new CreateOrderRequestDTO();

        request.setPlanningId(planning.getId());
        request.setLicense(planning.getLicense());
        request.setCustomerName(planning.getCustomerName());
        request.setCustomerNumber(planning.getCustomerNumber());
        request.setCarMileage(planning.getCarMileage());
        request.setCarMake(planning.getCarMake());

        List<OrderPartResuestDTO> parts = new ArrayList<>();

        for (PlanningLine line : planning.getLines()) {
            OrderPartResuestDTO part = new OrderPartResuestDTO();
            part.setPartNo(line.getItemCode());
            part.setDescription(line.getDescription());
            part.setQuantity(line.getQuantity());
            part.setPrice(line.getPrice());
            parts.add(part);
        }

        request.setParts(parts);    
        
        // 2️⃣ Call Order Service
        // String url = "http://ORDER-SERVICE/api/orders/from-planning";
        // CreateOrderResponseDTO response = restTemplate.postForObject(url, request, CreateOrderResponseDTO.class);
        CreateOrderResponseDTO response = orderClient.createOrder(request);
        
        // Save order no in planning
        planning.setOrderId(response.getOrderId());
        planning.setStatus("ORDER_CREATED");
        planningRepository.save(planning);

        return CompletableFuture.completedFuture(response);
    }

    public CompletableFuture<CreateOrderResponseDTO> orderFallback(Long id, Exception ex) {

        System.out.println("Circuit Breaker activated: " + ex.getMessage());

        CreateOrderResponseDTO fallback = new CreateOrderResponseDTO();
        fallback.setOrderId(null);
        return CompletableFuture.completedFuture(fallback);
    }

}
