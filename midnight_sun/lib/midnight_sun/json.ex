Application.ensure_all_started(:timex)

defmodule Cities do
  def load do
    File.read!("../data.json")
    |> Jason.decode!()
    |> Enum.map(fn city ->
      videoSearch = "https://www.youtube.com/results?search_query=#{city["n"]}"

      city
      |> Map.put("videoSearch", String.replace(videoSearch, " ", "%20"))
    end)
  end

  # defp ifAlreadyFound do
  #   File.read!("../videos.json")
  # end

  # def videos do
  #   load()
  #   |> Enum.reduce_while(%{}, fn city, _acc ->
  #     IO.puts(city["videoSearch"])
  #     video = IO.gets("https / ⏎")

  #     if video != "\n",
  #       do: {:cont, city |> Map.put("video", video) |> save_results},
  #       else: {:halt}
  #   end)
  # end

  # def save_results(data) do
  #   {:ok, file} = File.open("../videos.json", [:append, {:delayed_write, 100, 20}])
  #   Enum.each(data, &IO.write(file, &1))
  #   File.close(file)
  # end

  def sunsets(time \\ Time.utc_now()) do
    load()
    |> Enum.map(fn city ->
      sunsetTime = Solar.event(:set, {city["lat"], city["lon"]}, timezone: "UTC")

      liveVideoSearch =
        "https://www.youtube.com/results?search_query=#{city["n"]}, #{city["c"]}&sp=EgJAAQ%253D%253D"

      city
      |> Map.put("liveVideoSearch", String.replace(liveVideoSearch, " ", "%20"))
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

  def liveSunsetPlaylistGen do
    Enum.reduce_while(1438..1439, [], fn currentMinute, acc ->
      hours = div(currentMinute, 60)
      mins = rem(currentMinute, 60)
      {:ok, time} = Time.new(hours, mins, 0)
      IO.puts(time)

      chosen_sunset =
        sunsets(time)
        |> Enum.reduce_while(%{}, fn city, acc ->
          IO.puts(city["liveVideoSearch"])
          live = IO.gets("https / ⏎")

          if live != "\n", do: {:halt, city |> Map.put("live", live)}, else: {:cont, acc}
        end)

      if Map.has_key?(chosen_sunset, "live") do
        {:ok, sunsetTime} = chosen_sunset["sunsetTime"]

        if(sunsetTime.hour * 60 + sunsetTime.minute < 1439) do
          {:cont, acc ++ chosen_sunset}
        else
          {:halt, acc ++ chosen_sunset}
        end
      else
        {:cont, acc}
      end
    end)
  end

  #
end
