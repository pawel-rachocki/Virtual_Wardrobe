package com.virtualwardrobe.backend.garment;

import static org.assertj.core.api.Assertions.assertThat;

import com.virtualwardrobe.backend.domain.Category;
import com.virtualwardrobe.backend.domain.Garment;
import com.virtualwardrobe.backend.domain.Tag;
import com.virtualwardrobe.backend.domain.User;
import com.virtualwardrobe.backend.repository.GarmentRepository;
import com.virtualwardrobe.backend.support.AbstractPostgresIT;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class GarmentRepositoryIT extends AbstractPostgresIT {

  @Autowired private GarmentRepository garmentRepository;
  @Autowired private EntityManager em;

  private UUID userAId;
  private UUID userBId;

  @BeforeEach
  void seed() {
    User userA = persistUser("a@example.com");
    User userB = persistUser("b@example.com");
    userAId = userA.getId();
    userBId = userB.getId();

    Tag casual = persistTag("casual", userA);
    Tag sport = persistTag("sport", userA);
    Tag casualB = persistTag("casual", userB);

    persistGarment("Alpha", Category.TOP, userA, Set.of(casual));
    persistGarment("Beta", Category.TOP, userA, Set.of(casual, sport));
    persistGarment("Gamma", Category.BOTTOM, userA, Set.of(sport));
    persistGarment("Delta", Category.SHOES, userA, Set.of());
    persistGarment("Zeta", Category.TOP, userB, Set.of(casualB));

    em.flush();
    em.clear();
  }

  @Test
  void brakFiltrow_zwracaWszystkieUbraniaUseraPosortowane() {
    List<Garment> result = garmentRepository.findForUserFiltered(userAId, null, null);

    assertThat(result)
        .extracting(Garment::getName)
        .containsExactly("Alpha", "Beta", "Delta", "Gamma");
  }

  @Test
  void filtrCategory_zwracaTylkoDanaKategorie() {
    List<Garment> result = garmentRepository.findForUserFiltered(userAId, "TOP", null);

    assertThat(result).extracting(Garment::getName).containsExactly("Alpha", "Beta");
  }

  @Test
  void filtrTag_zwracaUbraniaZTagiemIPelnyZestawTagow() {
    List<Garment> result = garmentRepository.findForUserFiltered(userAId, null, "casual");

    assertThat(result).extracting(Garment::getName).containsExactly("Alpha", "Beta");
    // Beta ma 2 tagi — filtr po jednym nie moze ucinac kolekcji (EXISTS + JOIN FETCH).
    Garment beta =
        result.stream().filter(g -> g.getName().equals("Beta")).findFirst().orElseThrow();
    assertThat(beta.getTags())
        .extracting(Tag::getName)
        .containsExactlyInAnyOrder("casual", "sport");
  }

  @Test
  void filtrCategoryITag_zwracaPrzeciecie() {
    List<Garment> result = garmentRepository.findForUserFiltered(userAId, "BOTTOM", "sport");

    assertThat(result).extracting(Garment::getName).containsExactly("Gamma");
  }

  @Test
  void filtrCategoryITag_pustyGdyBrakPrzeciecia() {
    List<Garment> result = garmentRepository.findForUserFiltered(userAId, "SHOES", "sport");

    assertThat(result).isEmpty();
  }

  @Test
  void izolacjaMultiTenant_userNieWidziUbranInnego() {
    List<Garment> result = garmentRepository.findForUserFiltered(userBId, null, null);

    assertThat(result).extracting(Garment::getName).containsExactly("Zeta");
  }

  @Test
  void brakDuplikatow_ubranieZWielomaTagamiRazWWyniku() {
    List<Garment> result = garmentRepository.findForUserFiltered(userAId, null, null);

    assertThat(result).extracting(Garment::getId).doesNotHaveDuplicates();
  }

  @Test
  void findByIdAndUserId_zwracaWlasneUbranieZTagami() {
    UUID betaId = garmentIdByName("Beta");

    Garment result = garmentRepository.findByIdAndUserId(betaId, userAId).orElseThrow();

    assertThat(result.getName()).isEqualTo("Beta");
    assertThat(result.getTags())
        .extracting(Tag::getName)
        .containsExactlyInAnyOrder("casual", "sport");
  }

  @Test
  void findByIdAndUserId_pustyGdyUbranieNalezyDoInnegoUsera() {
    UUID zetaId = garmentIdByName("Zeta");

    assertThat(garmentRepository.findByIdAndUserId(zetaId, userAId)).isEmpty();
  }

  @Test
  void findByIdAndUserId_pustyGdyUbranieNieIstnieje() {
    assertThat(garmentRepository.findByIdAndUserId(UUID.randomUUID(), userAId)).isEmpty();
  }

  private UUID garmentIdByName(String name) {
    return em.createQuery("SELECT g.id FROM Garment g WHERE g.name = :name", UUID.class)
        .setParameter("name", name)
        .getSingleResult();
  }

  private User persistUser(String email) {
    User user = User.builder().email(email).passwordHash("hash").build();
    em.persist(user);
    return user;
  }

  private Tag persistTag(String name, User user) {
    Tag tag = Tag.builder().name(name).user(user).build();
    em.persist(tag);
    return tag;
  }

  private void persistGarment(String name, Category category, User user, Set<Tag> tags) {
    Garment garment =
        Garment.builder()
            .name(name)
            .brand("brand")
            .color("color")
            .season("season")
            .category(category)
            .imageUrl(name + ".png")
            .user(user)
            .tags(tags)
            .build();
    em.persist(garment);
  }
}
