Application.ensure_all_started(:timex)

defmodule Cities do
  def load do
    File.read!("../data.json")
    |> Jason.decode!()
  end

  def sunsets(time \\ Time.utc_now()) do
    load()
    |> Enum.map(fn city ->
      sunsetTime = Solar.event(:set, {city["lat"], city["lon"]}, timezone: "UTC")

      url =
        "https://www.youtube.com/results?search_query=#{city["n"]}, #{city["c"]}&sp=EgJAAQ%253D%253D"

      city
      |> Map.put("url", String.replace(url, " ", "%20"))
      |> Map.put("sunsetTime", sunsetTime)
    end)
    |> Enum.filter(fn x -> elem(x["sunsetTime"], 0) != :error end)
    |> Enum.filter(fn x ->
      {:ok, sunsetTime} = x["sunsetTime"]
      timeLeft = Time.diff(sunsetTime, time)

      0 < timeLeft && timeLeft < 15 * 60
    end)

    # |> Enum.sort(fn a, b -> a["pop"] > b["pop"] end)
  end

  def check do
    Enum.reduce_while(1..1440, 0, fn currentMinute, acc ->
      {:ok, time} = Time.new(0, currentMinute, 0)

      chosen_sunset =
        sunsets(time)
        |> Enum.reduce_while(%{}, fn city, acc ->
          url = IO.gets("https / ⏎")

          if url != "\n", do: {:halt, city |> Map.put("live", url)}, else: {:cont, acc}
        end)
        |> Enum.at(-1)

      {:ok, sunsetTime} = chosen_sunset["sunsetTime"]

      if chosen_sunset |> length > 0,
        do: {:cont, sunsetTime.hour * 60 + sunsetTime.minute},
        else: {:cont, acc + 1}
    end)
  end

  #
end
